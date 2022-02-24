import { countries } from '@hectare/geo'

export const getCountries = async (req, res) => {
  const c = await countries.getAll()
  return res.status(200).send({ c })
}

export const getCountry = async (req, res) => {
  const country = await countries.get(req.params.id)
  return res.status(200).send({ ...country?.toJSON() })
}

export const createCountry = async (req, res) => {
  const country = await countries.create(req.body)
  return res.status(200).send({ ...country?.toJSON() })
}

export const editCountry = async (req, res) => {
  const country = await countries.update(req.params.id, req.body)
  return res.status(200).send({ ...country?.toJSON() })
}
