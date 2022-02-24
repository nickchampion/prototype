import { DEFAULT_OPTS } from '@hectare/db'
import { Document, Model, LeanDocument, Schema, model } from 'mongoose'

export enum UnitTypes {
  impireal = 'imperial',
  metric = 'metric'
}

export interface UnitFields {
  distance: UnitTypes
  weight: UnitTypes
  capacity: UnitTypes
  temperature: UnitTypes
}

export interface CountryFields {
  name: string
  iso_2: string
  iso_3: string
  currency: string
  locales: string
  calling_code: string
  enabled: boolean
  zone_descriptor: string
  zones: Array<string>
  unit: UnitFields
}

export interface CountryDoc extends CountryFields, Document {}

type CountryModel = Model<CountryDoc>

export type CountryDocLean = LeanDocument<CountryDoc>

export const countrySchema = new Schema(
  {
    name: {
      type: String,
      immutable: true
    },
    iso_2: {
      type: String,
      immutable: true,
      index: true
    },
    iso_3: {
      type: String,
      immutable: true
    },
    currency: {
      type: String
    },
    locales: {
      type: String
    },
    calling_code: {
      type: String,
      immutable: true
    },
    enabled: {
      type: Boolean,
      default: false,
      select: false,
      index: true
    },
    zone_descriptor: {
      type: String
    },
    zones: {
      type: [String]
    },
    unit: {
      distance: {
        type: String,
        enum: UnitTypes,
        default: UnitTypes.metric
      },
      weight: {
        type: String,
        enum: UnitTypes,
        default: UnitTypes.metric
      },
      capacity: {
        type: String,
        enum: UnitTypes,
        default: UnitTypes.metric
      },
      temperature: {
        type: String,
        enum: UnitTypes,
        default: UnitTypes.metric
      }
    }
  },
  DEFAULT_OPTS
)

export const Country = model<CountryDoc, CountryModel>('country', countrySchema)
