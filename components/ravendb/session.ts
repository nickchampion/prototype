import { IDocumentSession, IDocumentStore, IDocumentQuery, QueryStatistics } from 'ravendb'
import { utils as raven_utils } from './utils'
import * as utils from '@hectare/platform.components.utils'
import { BaseModel, Page, IProfiler, IApiModel } from '@hectare/platform.components.common'
import { QuerySettings, SearchOperator } from '@hectare/platform.components.common'

/**
 * Class used for actions to run when a session commit either fails or succeeds
 */
export class SessionAction {
  fn: (session: Session) => Promise<void>
  name: string

  constructor(fn: (session: Session) => Promise<void>, name: string) {
    this.fn = fn
    this.name = name
  }
}

/**
 * Wrapper around database access scoped per event
 */
export class Session {
  private _profiler: IProfiler
  private _store: IDocumentStore
  private _commit_actions: SessionAction[]
  private _rollback_actions: SessionAction[]

  public commit_on_get: boolean // used by get requests to indicate we want to save the session, usually we dont commit the session on a get
  public database: IDocumentSession
  public veto: boolean

  constructor(store: IDocumentStore, profiler: IProfiler) {
    this._store = store
    this._commit_actions = []
    this._rollback_actions = []
    this._profiler = profiler

    this.database = store.openSession()
    this.veto = false
    this.commit_on_get = false
  }

  // IMPORTANT: session commit actions need to follow a pattern.
  // 1. Renew the session at the start of your action so you get a fresh session (use session.renew())
  // 2. Perform whatever actions you need to using your new session if applicable
  // 3. do not use session.commit() as this will end up in an infinite loop, use session.database.saveChanges()
  // or session.commit(true) to skip executing the session commit actions
  add_commit_action(action: SessionAction): void {
    this._commit_actions.push(action)
  }

  /**
   * Add an action which will be invoked should the session commit fail
   * @param action
   */
  add_rollback_action(action: SessionAction): void {
    this._rollback_actions.push(action)
  }

  /**
   * starts a new session
   */
  abort(): void {
    this.database = this._store.openSession()
  }

  /**
   * reset the session, often used for concurrency retry loops
   * @param delay time in milliseconds to pause before resetting
   */
  async reset(delay?: number): Promise<void> {
    if (delay) await raven_utils.sleep(delay)

    this.database = this._store.openSession()
    this._commit_actions = []
    this._rollback_actions = []
  }

  /**
   * Commit the session and run any commit actions. If the commit fails, run any rollback actions
   * @param skip_commit_actions skip commit actions
   * @returns
   */
  async commit(skip_commit_actions = false): Promise<void> {
    if (this.veto || !this.database) return

    const execute_actions = async (actions: SessionAction[]) => {
      for (const action of actions) {
        try {
          if (this._profiler)
            this._profiler.measure(action.name, async () => action.fn(new Session(this._store, this._profiler)))
          else action.fn(new Session(this._store, this._profiler))
        } catch (e) {
          console.log(e) //TODO: proper logging
        }
      }
    }

    try {
      // attempt to save the session to the database
      if (this._profiler) await this._profiler.measure('sc', async () => this.database.saveChanges())
      else await this.database.saveChanges()
    } catch (e) {
      if (this._rollback_actions.length) {
        await execute_actions(this._rollback_actions)
      }
      throw e
    }

    // run any post commit actions unless explicitly specfied not to
    if (!skip_commit_actions) await execute_actions(this._commit_actions)

    // reset
    this.database = null
    this._commit_actions = []
    this._rollback_actions = []
  }

  /**
   * Used to stream large number of documents from the database. Documents that are streamed are not tracked by the session
   * So any changes will not be part of the commit.
   * @param qry normal IDocumentQuery to find the documents you want to stream
   * @param map optional map to convert the documents from the source into another type
   * @returns
   */
  async stream<T extends BaseModel, TResult>(
    qry: IDocumentQuery<T>,
    map: (doc: T) => TResult
  ): Promise<TResult[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const s = await this.database.advanced.stream(qry)
        const records = []

        s.on('data', data => {
          records.push(map ? map(data) : data.document)
        })

        s.on('error', err => {
          reject(err)
        })

        s.on('end', async () => {
          resolve(records)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Try to execute some code within a retry loop to handle cases where we might get concurrency exceptions
   * @param action the aaction we wish to execute
   * @param retries number of retries
   * @param delay delay in milliseconds between retries
   * @param profiler measure the execution time
   * @returns
   */
  async try(action: () => Promise<unknown>, retries: number, delay: number): Promise<unknown> {
    for (let i = 1; i <= retries; i += 1) {
      try {
        const response = await action()
        await this.commit()
        return response
      } catch (e) {
        if (e.name && e.name === 'ConcurrencyException') {
          // throw if we've exhausted our retries
          if (i === retries) throw e

          // reset the session and let the loop try the action again
          await this.reset(delay)
        } else {
          throw e
        }
      }
    }
  }

  /**
   * Store a document
   * @param source instance of the model to store in the DB
   */
  async store<T extends BaseModel>(source: T): Promise<void> {
    source.created_at = utils.utc()
    source.updated_at = source.created_at
    await this.database.store(source)
  }

  /**
   * Loads a document and updates only the fields contained in the patch
   * @param patch fields on the document to update
   * @param beforePatch optional function to run before we patch
   * @returns
   */
  async patch<T extends BaseModel>(patch: Partial<T>, before_patch: (doc: T) => Promise<void>): Promise<T> {
    if (patch && patch.id) {
      const doc = await this.database.load<T>(patch.id)

      if (doc) {
        if (before_patch) await before_patch(doc)
        doc.updated_at = utils.utc()
        raven_utils.copy(patch, doc)
        return doc
      }
    }

    throw new Error(`Document with id ${patch.id} was not found`)
  }

  /**
   * get a document from the database by ID. you can optionally pass in includes, this is a object in this format { user: 'userId' }
   * this will automatically populate a field called user on the returned model using the userId field on the source document to find the user
   * @param id id of the document
   * @param includes includes load referenced documents into the current session by the path to those IDs in the source document, reducing round trips
   * @param apply_includes if this is true the includes will be applied to a property on the model before being returned
   * @returns
   */
  async get<T extends BaseModel | IApiModel>(
    id: string,
    includes?: Record<string, string>,
    apply_includes?: boolean
  ): Promise<T> {
    let doc

    if (includes) {
      const keys = Object.keys(includes)

      if (keys.length) {
        let r = this.database.include(includes[keys[0]])
        for (const key in keys.slice(1)) {
          r = r.include(includes[key])
        }
        doc = await r.load<T>(id)
      } else {
        doc = await this.database.load<T>(id)
      }
    } else {
      doc = await this.database.load<T>(id)
    }

    if (doc && includes && apply_includes) {
      for (const key of Object.keys(includes)) {
        doc[key] = doc[includes[key]] ? await this.get(doc[includes[key]]) : null
      }
    }

    return doc
  }

  /**
   * Delete a document
   * @param doc
   * @returns
   */
  async delete<T extends BaseModel>(doc: T): Promise<void> {
    if (!doc) return
    await this.database.delete<T>(doc)
  }

  async query<T extends BaseModel>(
    model: new () => T,
    fn: (q: IDocumentQuery<T>) => IDocumentQuery<T>
  ): Promise<Page<T>> {
    const q = fn(
      this.database.query<T>({
        indexName: new model().get_index_name()
      })
    )

    let stats: QueryStatistics = null
    const res = await q.statistics(s => (stats = s)).all()

    return {
      results: res,
      total_docs: stats.totalResults,
      elasped: stats.durationInMs
    }
  }

  /**
   * Generic handler for searching an index
   * @param model model type used to determine which index to search against
   * @param filters any filters in object notation format { name: "nick" }
   * @param limit number of results to return
   * @param offset offset from the beginning of the result
   * @param includes any includes to pullback with each document in the results
   * @param augment a function to augment the query for additional flexibility
   * @returns
   */
  async search<T extends BaseModel>(
    model: new () => T,
    settings?: QuerySettings,
    includes?: Record<string, string>,
    augment?: (q: IDocumentQuery<T>) => IDocumentQuery<T>
  ): Promise<Page<T>> {
    let query = this.database.query<T>({
      indexName: new model().get_index_name()
    })

    // ensure we use the correct operator, defaults to AND
    query =
      settings.operator === SearchOperator.And
        ? query.usingDefaultOperator('AND')
        : query.usingDefaultOperator('OR')

    if (settings.filters) {
      Object.keys(settings.filters).forEach(key => {
        const negate = settings.filters[key][0] === '-'
        const value = negate ? settings.filters[key].toString().substr(1) : settings.filters[key].toString()

        if (value.indexOf(',') >= 0) {
          query = negate ? query.not().whereIn(key, value.split(',')) : query.whereIn(key, value.split(','))
        } else {
          query = negate ? query.whereNotEquals(key, value) : query.whereEquals(key, value)
        }
      })
    }

    if (includes) {
      Object.keys(includes).forEach(key => {
        query = query.include(includes[key])
      })
    }

    if (augment) {
      query = augment(query)
    }

    if (settings.sort) {
      query = settings.sort_desc ? query.orderByDescending(settings.sort) : query.orderBy(settings.sort)
    }

    // apply the paging settings to the query and materialise the results
    const r = await raven_utils.page(settings.limit, settings.offset, query)

    // map any includes to the specified fields
    if (includes) {
      for (const result of r.results) {
        for (const key of Object.keys(includes)) {
          result[key] = await this.database.load<T>(result[includes[key]]) // preloaded so no round trip to db here
        }
      }
    }

    return r
  }
}
