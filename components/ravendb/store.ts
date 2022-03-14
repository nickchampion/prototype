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

  Object.keys(models).forEach(key => {
    store.conventions.registerEntityType(models[key])
  })

  store.conventions.useOptimisticConcurrency = true
  store.conventions.findCollectionNameForObjectLiteral = (entity: BaseModel): string => entity['_collection']
  store.initialize()

  // eslint-disable-next-line no-console
  console.log(
    `RavenDB: Successfully connected to ${configuration.ravendb.endpoints.join(',')}:${
      configuration.ravendb.database_name
    } in ${new Date().valueOf() - start}ms`
  )

  return store
}
