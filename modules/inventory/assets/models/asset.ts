import { BaseModel } from '@hectare/platform.components.common'

export enum AssetLocation {
  Field,
  Storage,
  Transit
}

export class Asset extends BaseModel {
  name: string
  organisation_id: string
  location: AssetLocation
  asset_types: string[]
  weight_kg: number
  volume_cubic_m: number

  constructor(fields?: Partial<Asset>) {
    super('Assets', 'assets')
    Object.assign(this, fields)
  }

  static id(id: string): string {
    return id.indexOf('/') === -1 ? `assets/${id.toUpperCase()}` : id
  }
}
