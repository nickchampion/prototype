/* eslint-disable no-param-reassign */
import { PatchByQueryOperation, IDocumentQuery, QueryStatistics, IndexQuery, IDocumentStore } from 'ravendb'
import { BaseModel, Page } from '@hectare/platform.components.common'

class Utils {
  async sleep(milliseconds: number): Promise<void> {
    new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  async page<T extends BaseModel>(limit = 10, offset = 0, qry: IDocumentQuery<T>): Promise<Page<T>> {
    let stats: QueryStatistics = null

    const q = qry.take(limit).skip(offset)
    const res = await q.statistics(s => (stats = s)).all()

    return {
      results: res,
      total_docs: stats.totalResults,
      limit: limit,
      offset: offset,
      elasped: stats.durationInMs
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
