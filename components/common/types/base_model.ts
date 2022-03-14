export class BaseModel {
  #index: string // # hash identifier ensures these fields dont get persisted to the database
  #collection: string

  public id: string
  public patch: string
  public created_at: Date
  public updated_at: Date

  constructor(index_name: string, collection_name: string) {
    this.#index = index_name
    this.#collection = collection_name
  }

  get_id(id: string): string {
    return id.indexOf('/') === -1 ? `${this.#collection}/${id}` : id
  }

  get_index_name(): string {
    return this.#index
  }

  static friendly_id(id: string): string {
    return id.indexOf('/') === -1 ? id : id.split('/')[1]
  }
}
