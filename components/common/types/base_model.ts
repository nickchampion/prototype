export class BaseModel {
  public index_name: string
  public collection_name: string
  public id: string
  public patch: string
  public created_at: Date
  public updated_at: Date

  constructor(index_name: string, collection_name: string) {
    this.index_name = index_name
    this.collection_name = collection_name
  }

  get_id(id: string): string {
    return id.indexOf('/') === -1 ? `${this.collection_name}/${id}` : id
  }
}
