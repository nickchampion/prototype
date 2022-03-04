import { BaseEvent } from '@hectare/platform.components.common'

export interface IAssetCreatedEvent extends BaseEvent {
  detail_type: string
  detail: {
    OCC_version: number
  }
}
