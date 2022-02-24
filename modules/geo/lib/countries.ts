import { Country, CountryDoc, CountryFields } from '../models'

const all = async (): Promise<CountryDoc[]> => {
  return await Country.find({ enabled: true })
}

const get = async (id: number): Promise<CountryDoc> => {
  return await Country.findById(id)
}

const create = async (body: CountryFields): Promise<CountryDoc> => {
  const fields: CountryFields = body
  const country = new Country({ ...fields })
  await country.save()
  return country
}

const update = async (id: number, body: CountryFields): Promise<CountryDoc> => {
  const fields: CountryFields = body
  const country = await Country.findById(id)

  if (!country) {
    throw new Error('Country not found')
  }

  if (fields.name) country.name = fields.name
  if (fields.iso_2) country.iso_2 = fields.iso_2
  if (fields.iso_3) country.iso_3 = fields.iso_3
  if (fields.currency) country.currency = fields.currency
  if (fields.locales) country.locales = fields.locales
  if (fields.calling_code) country.calling_code = fields.calling_code
  if (fields.enabled) country.enabled = fields.enabled
  if (fields.zone_descriptor) country.zone_descriptor = fields.zone_descriptor
  if (fields.zones) country.zones = fields.zones
  if (fields.unit) country.unit = { ...country.unit, ...fields.unit }

  await country.save()
  return country
}

export const countries = {
  all,
  get,
  update,
  create
}
