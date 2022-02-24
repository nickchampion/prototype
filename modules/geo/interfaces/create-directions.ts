export interface CreateGeoDirectionInterface {
  coordinates: string
  geometries: string
  traffic: boolean
  steps: boolean
  max_height: number
  max_width: number
  persist?: boolean
}
