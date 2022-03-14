import { BaseModel } from '../types'

export class Organisation extends BaseModel {
  name: string

  constructor(fields?: Partial<Organisation>) {
    super('Organisations', 'organisations')
    Object.assign(this, fields)
  }

  static id(id: string): string {
    return id.indexOf('/') === -1 ? `organisations/${id.toUpperCase()}` : id
  }
}
