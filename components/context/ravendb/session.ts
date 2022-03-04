/* eslint-disable no-await-in-loop */
import { IDocumentSession, IDocumentStore, IDocumentQuery } from 'ravendb'
import { Context } from '../context'
import { utils as raven_utils } from './utils'
import * as utils from '@hectare/platform.components.utils'
import { ISessionAction, ISession, BaseModel, Page, Query } from '@hectare/platform.components.common'

export class Session implements ISession {
  private _store: IDocumentStore
  private _context: Context
  private _commit_actions: ISessionAction[]
  private _rollback_actions: ISessionAction[]
  public commit_on_get: boolean // used by get requests to indicate we want to save the session, usually we dont store anything from a get
  public database: IDocumentSession
  public veto: boolean

  constructor(context: Context, store: IDocumentStore) {
    this._store = store
    this._context = context
    this._commit_actions = []
    this._rollback_actions = []

    this.database = store.openSession()
    this.veto = false
    this.commit_on_get = false
  }

  // IMPORTANT: session commit actions need to follow a pattern.
  // 1. Renew the session at the start of your action so you get a fresh session (use session.renew())
  // 2. Perform whatever actions you need to using your new session if applicable
  // 3. do not use session.commit() as this will end up in an infinite loop, use session.database.saveChanges()
  // or session.commit(true) to skip executing the session commit actions
  add_commit_action(action: ISessionAction): void {
    this._commit_actions.push(action)
  }

  add_rollback_action(action: ISessionAction): void {
    this._rollback_actions.push(action)
  }

  abort(): void {
    this.database = this._store.openSession()
  }

  async reset(delay: number): Promise<void> {
    if (delay) await raven_utils.sleep(delay)

    this.database = this._store.openSession()
    this._commit_actions = []
    this._rollback_actions = []
  }

  async commit(skipCommitActions = false): Promise<void> {
    if (this.veto || this.database === null) return

    try {
      // attempt to save the session to the database
      if (this._context && this._context.profiler)
        await this._context.profiler.measure('sc', async () => this.database.saveChanges())
      else await this.database.saveChanges()
    } catch (e) {
      if (this._rollback_actions.length > 0) {
        for (const action of this._rollback_actions) {
          await utils.try_execute_async(
            () => this._context.profiler.measure(action.name, async () => action.fn(this._context)),
            error => {
              console.log(error)
              return null
            }
          )
        }
      }
      throw e
    }

    if (skipCommitActions) return

    for (const action of this._commit_actions) {
      await utils.try_execute_async(
        () => this._context.profiler.measure(action.name, async () => action.fn(this._context)),
        error => {
          console.log(error)
          return null
        }
      )
    }

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
   * Try to execute some code within a retry loop to handle cases where we might get concurrency issues
   * @param action the aaction we wish to execute
   * @param retries number of retries
   * @param delay delay in milliseconds between retries
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
    await this.database.store(source)
  }

  /**
   * Loads a document and updates only the fields contained in the patch input
   * @param patch fields on the document to update
   * @param beforePatch optional function to run before we patch
   * @returns
   */
  async patch<T extends BaseModel>(patch: Partial<T>, beforePatch: (doc: T) => Promise<void>): Promise<T> {
    if (patch && patch.id) {
      const doc = await this.database.load<T>(patch.id)

      if (doc) {
        if (beforePatch) await beforePatch(doc)
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
   * @param includes any includes to return
   * @param doNotApplyIncludes ignore any includes
   * @returns
   */
  async get<T extends BaseModel>(
    id: string,
    includes?: Record<string, string>,
    doNotApplyIncludes?: boolean
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

    if (doc && includes && !doNotApplyIncludes) {
      // we're modifying with includes so we should never be saving back to the DB after this, so evict
      this.database.advanced.evict(doc)

      // eslint-disable-next-line no-restricted-syntax
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

  /**
   * Generic handler for searching an index
   * @param model model type used to determine which index to search against
   * @param filters any filters in object notation format { name: "nick" }
   * @param includes any includes to pullback with each document in the results
   * @param augment a function to augment the query for additional flexibility
   * @returns
   */
  async search<T extends BaseModel>(
    model: new () => T,
    filters: Record<string, unknown>,
    includes?: Record<string, string>,
    augment?: (q: Query<T>) => Query<T>
  ): Promise<Page<T>> {
    let query = raven_utils.query(
      this.database.query<T>({
        indexName: new model().index_name
      })
    )

    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.whereEquals(key, filters[key])
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

    const r = await raven_utils.page(this._context, query.query)

    // map any includes to the specified fields
    if (includes) {
      for (const result of r.results) {
        // we're modifying with includes so we should never be saving back to the DB after this, so evict
        this.database.advanced.evict(result)

        for (const key of Object.keys(includes)) {
          result[key] = await this.get(result[includes[key]])
        }
      }
    }

    return r
  }
}

module.exports = Session
