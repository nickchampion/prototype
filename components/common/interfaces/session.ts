import { IContext } from './context'
import { BaseModel } from '../types'
import { Page, Query } from '@hectare/platform.components.common'
import { IDocumentSession, IDocumentQuery } from 'ravendb'

export interface ISession {
  veto: boolean
  commit_on_get: boolean
  database: IDocumentSession

  add_commit_action(action: ISessionAction): void
  add_rollback_action(action: ISessionAction): void
  abort(): void
  reset(delay: number): Promise<void>
  commit(skipCommitActions?: boolean): Promise<void>
  try(action: () => Promise<unknown>, retries: number, delay: number): Promise<unknown>
  store<T extends BaseModel>(source: T): Promise<void>
  patch<T extends BaseModel>(patch: unknown, beforePatch): Promise<T>
  get<T extends BaseModel>(id: string, includes?: Record<string, string>, doNotApplyIncludes?: boolean): Promise<T>
  delete<T extends BaseModel>(model: T): Promise<void>
  search<T extends BaseModel>(
    model: new () => T,
    filters: Record<string, unknown>,
    includes?: Record<string, string>,
    augment?: (q: Query<T>) => Query<T>
  ): Promise<Page<T>>
  stream<T extends BaseModel, TResult>(qry: IDocumentQuery<T>, map: (doc: T) => TResult): Promise<TResult[]>
}

export interface ISessionAction {
  fn: (context: IContext) => Promise<void>
  name: string
}
