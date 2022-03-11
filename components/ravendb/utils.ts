/* eslint-disable no-param-reassign */
import { PatchByQueryOperation, IDocumentQuery, QueryStatistics, IndexQuery, IDocumentStore } from 'ravendb'
import { Context } from '@hectare/platform.components.context'
import { BaseModel, Page, Query } from '@hectare/platform.components.common'

class Utils {
  query<T extends BaseModel>(q: IDocumentQuery<T>): Query<T> {
    return new Query<T>(q)
  }
  async sleep(milliseconds: number): Promise<void> {
    new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  async page<T extends BaseModel>(context: Context, qry: IDocumentQuery<T>, limit = 10): Promise<Page<T>> {
    let stats: QueryStatistics = null
    const count = context.event.query && context.event.query.limit ? (context.event.query.limit as number) : limit
    const offset = context.event.query && context.event.query.offset ? (context.event.query.offset as number) : 0

    const q = qry.take(count).skip(offset)
    const res = await q.statistics(s => (stats = s)).all()

    return {
      results: res,
      total_docs: stats.totalResults,
      limit: count,
      offset: offset
    }
  }
  copy<TSource, TDestination>(source: TSource, destination: TDestination, ignore?: string[]): TDestination {
    Object.keys(source).forEach(key => {
      if (!ignore || !ignore.includes(key)) destination[key] = source[key]
    })
    return destination
  }
  async patch(store: IDocumentStore, patchQuery: IndexQuery, waitForCompletion = true): Promise<void> {
    const p = new PatchByQueryOperation(patchQuery)
    const operation = await store.operations.send(p)
    if (waitForCompletion) await operation.waitForCompletion()
  }
}

export const utils = new Utils()
