import { AmazonRegions } from '../../../../enumerations/aws/regions.enum'

export interface RegionResponse {
  status_code: number
  body: string
}

export interface RegionData {
  region: AmazonRegions
}
