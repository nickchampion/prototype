import mongoose from 'mongoose'
// import { Page } from '@hectare/platform.components.common'

export class MongoApi<T> {
  model: mongoose.Model<T>
  session: mongoose.ClientSession

  constructor(model: mongoose.Model<T>, session: mongoose.ClientSession) {
    this.model = model
    this.session = session
  }

  /**
   * get returns a lean version of the document
   */
  async get(id: unknown): Promise<T> {
    return this.model.findById(id).session(this.session).lean()
  }

  /**
   * load retrieves a document hydrated and should be used for modifying docs
   * @param id
   * @returns
   */
  async load(id: unknown): Promise<T> {
    return this.model.findById(id).session(this.session)
  }

  async create(document: T): Promise<mongoose.HydratedDocument<T>> {
    const doc = new this.model(document, { session: this.session })
    await doc.save()
    return doc
  }

  async create_many(documents: T[]): Promise<mongoose.HydratedDocument<T>[]> {
    return await this.model.insertMany(documents, { session: this.session })
  }

  // async search(query?: mongoose.FilterQuery<T>, options?: mongoose.PaginateOptions): Promise<Page<T>> {
  //   const paging_model = this.model as mongoose.PaginateModel<T>

  //   if (!paging_model) throw new Error('Model does not support paging')

  //   const results = await paging_model.paginate(query, options)

  //   return {
  //     results: results.docs,
  //     total_docs: results.totalDocs,
  //     limit: results.limit,
  //     offset: results.offset
  //   }
  // }
}
