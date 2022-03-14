import { AssetLocation, Asset } from '../models/asset'
import { Organisation } from '@hectare/platform.components.common'

export interface IOrganisationJson {
  id: string
  name: string
}

/**
 * AssetJson is the asset representation returned from the API, gives us flexibility over the data we expose
 * Should be described in the manifest.yml
 */
export class AssetJson {
  id: string
  name: string
  organisation_id: string
  organisation: IOrganisationJson
  location: AssetLocation
  asset_types: string[]
  weight_kg: number
  volume_cubic_m: number

  constructor(asset: Asset, organisation?: Partial<Organisation>) {
    Object.assign(this, asset)

    this.id = Asset.friendly_id(this.id)
    this.organisation_id = Asset.friendly_id(this.organisation_id)

    this.organisation = {
      name: organisation?.name,
      id: Asset.friendly_id(asset.organisation_id)
    }

    // remove database metadata
    delete this['@metadata']
  }
}
