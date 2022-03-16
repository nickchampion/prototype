import { DocumentStore, IAuthOptions, ObjectTypeDescriptor } from 'ravendb'
import { configuration } from '@hectare/platform.components.configuration'
import { BaseModel } from '@hectare/platform.components.common'

export const create_document_store = (models: { [name: string]: ObjectTypeDescriptor }): DocumentStore => {
  const start = new Date().valueOf()
  const cert: IAuthOptions = {
    certificate: configuration.ravendb.certificate,
    type: 'pem'
  }

  const auth_options: IAuthOptions = configuration.ravendb.certificate ? cert : null

  const store = new DocumentStore(
    configuration.ravendb.endpoints,
    configuration.ravendb.database_name,
    auth_options
  )

  // By registering our models with the document store RavenDB will know to track these entities when used within a session
  Object.keys(models).forEach(key => {
    store.conventions.registerEntityType(models[key])
  })

  // Will throw ConcurrencyError is we attempt to update a document that was updated since we loaded it
  // RavenDB does not use locking, so there may be occasions when we need to handle concurrency exceptions
  store.conventions.useOptimisticConcurrency = true
  // This allows us to identofy the collection documents belong to by reading the private #collection field
  store.conventions.findCollectionNameForObjectLiteral = (entity: BaseModel): string => entity['#collection']
  store.initialize()

  console.log(
    `RavenDB: Successfully connected to ${configuration.ravendb.endpoints.join(',')}:${
      configuration.ravendb.database_name
    } in ${new Date().valueOf() - start}ms`
  )

  return store
}
