import { Context } from '@hectare/platform.components.context'
import { Page } from '@hectare/platform.components.common'
import { Asset } from '../models'

export const get = async (context: Context): Promise<Asset> => {
  return await context.session.get<Asset>(context.event.id())
}

export const search = async (context: Context): Promise<Page<Asset>> => {
  return await context.session.search<Asset>(Asset, { name: context.event.query.name })
}

export const create = async (context: Context): Promise<Asset> => {
  const asset = context.event.payload_as<Asset>()
  await context.session.store<Asset>(asset)
  return asset
}

export const create_many = async (context: Context, assets: Asset[]): Promise<Asset[]> => {
  for (const asset of assets) await context.session.store(asset)
  return assets
}
