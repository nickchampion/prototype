import { Context } from '@hectare/platform.components.context'
import { Page } from '@hectare/platform.components.common'
import { Asset } from '../models'

export const get = async (context: Context): Promise<Asset> => {
  // returns the asset with the organisation field set by the include specified below
  return await context.session.get<Asset>(context.event.id(), { organisation: 'organisation_id' })
}

export const patch = async (context: Context, patch: Partial<Asset>): Promise<Asset> => {
  const asset = await context.session.get<Asset>(context.event.id())

  // note no need to save to the database, this change will be tracked by RavenDB and automatically saved
  // when the session commits at the end of the request / event
  if (asset) {
    Object.assign(asset, patch)
  }

  return asset
}

export const search = async (context: Context): Promise<Page<Asset>> => {
  return await context.session.search<Asset>(
    Asset,
    { name: context.event.query.name, type: context.event.query.type }, // filters to search on
    { organisation: 'organisation_id' } // this is an include, which will set the organisation property on all assets, loaded from the referenced organisation document
  )
}

export const create = async (context: Context): Promise<Asset> => {
  const asset = context.event.payload_as<Asset>()
  // this will not trigger a call to the database, but will assign an id to the asset on the client
  // the asset will be pushed to the database when we commit the session, but it can be loaded from the session
  // once we've called store
  await context.session.store<Asset>(asset)
  return asset
}

export const create_many = async (context: Context, assets: Asset[]): Promise<Asset[]> => {
  for (const asset of assets) await context.session.store(asset)
  return assets
}
