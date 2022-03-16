import { IDocumentQuery } from 'ravendb'
import { BaseModel } from '@hectare/platform.components.common'

export class Query<T extends BaseModel> {
  private _hasFilter = false
  public query: IDocumentQuery<T>

  constructor(query: IDocumentQuery<T>) {
    this.query = query
  }

  whereEquals(key: string, value: unknown): Query<T> {
    if (this._hasFilter) {
      this.query = this.query.andAlso().whereEquals(key, value)
    } else {
      this._hasFilter = true
      this.query = this.query.whereEquals(key, value)
    }
    return this
  }
  whereNotEquals(key: string, value: unknown): Query<T> {
    if (this._hasFilter) {
      this.query = this.query.andAlso().whereNotEquals(key, value)
    } else {
      this._hasFilter = true
      this.query = this.query.whereNotEquals(key, value)
    }
    return this
  }
  whereIn(key: string, value: string | string[]): Query<T> {
    if (this._hasFilter) {
      this.query = this.query.andAlso().whereIn(key, Array.isArray(value) ? value : value.split(','))
    } else {
      this._hasFilter = true
      this.query = this.query.whereIn(key, Array.isArray(value) ? value : value.split(','))
    }
    return this
  }
  whereNotIn(key: string, value: string | string[]): Query<T> {
    if (this._hasFilter) {
      this.query = this.query
        .andAlso()
        .not()
        .whereIn(key, Array.isArray(value) ? value : value.split(','))
    } else {
      this._hasFilter = true
      this.query = this.query.not().whereIn(key, Array.isArray(value) ? value : value.split(','))
    }
    return this
  }
  whereBetween(key: string, start: unknown, end: unknown): Query<T> {
    if (this._hasFilter) {
      this.query = this.query.andAlso().whereBetween(key, start, end)
    } else {
      this._hasFilter = true
      this.query = this.query.whereBetween(key, start, end)
    }
    return this
  }
  include(path: string): Query<T> {
    this.query = this.query.include(path)
    return this
  }
}
