/* eslint-disable @typescript-eslint/no-var-requires */
import axios from 'axios'

const mock_url = 'https://fake-api.company-information.service.gov.uk'
const mock_key = '1234'

const mock_profile = {
  company_name: 'company',
  company_number: 'company_01',
  company_status: 'active'
}

const mock_register = {
  company_number: 'company_01',
  registers: {
    directors: {
      items: [
        {
          links: {
            filing: 'filing_link'
          },
          moved_on: new Date(),
          register_moved_to: 'unknown'
        }
      ],
      links: {
        directors_register: 'director'
      },
      register_type: 'directors'
    }
  }
}

const mock_filing_history = {
  etag: 'etag',
  filing_history_status: 'empty',
  items: [],
  items_per_page: 10,
  start_index: 1,
  total_count: 0
}

const mock_search_result = {
  etag: 'search',
  items: [],
  items_per_page: 10,
  kind: 'test',
  start_index: 1,
  total_results: 0
}

describe('Companies House', () => {
  beforeAll(() => {
    process.env.COMPANIES_HOUSE_URL = mock_url
    process.env.COMPANIES_HOUSE_KEY = mock_key
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetch resource', () => {
    it('should return mock profile', async () => {
      const url = `${mock_url}/company/company_01`
      const { fetchResource } = require('../queries')
      const mock = jest.spyOn(axios, 'get')
      mock.mockImplementationOnce(() => Promise.resolve({ data: mock_profile }))

      await expect(fetchResource('company_01', 'profile')).resolves.toEqual(mock_profile)
      expect(mock).toHaveBeenCalledWith(url, { headers: { authorization: `Basic ${mock_key}` } })
    })
    it('should return mock register', async () => {
      const url = `${mock_url}/company/company_01/register`
      const { fetchResource } = require('../queries')
      const mock = jest.spyOn(axios, 'get')
      mock.mockImplementationOnce(() => Promise.resolve({ data: mock_register }))

      await expect(fetchResource('company_01', 'register')).resolves.toEqual(mock_register)
      expect(mock).toHaveBeenCalledWith(url, { headers: { authorization: `Basic ${mock_key}` } })
    })
  })

  describe('fetch resource list', () => {
    it('should return mock filing-history', async () => {
      const url = `${mock_url}/company/company_01/filing-history`
      const { fetchResourceList } = require('../queries')
      const mock = jest.spyOn(axios, 'get')
      mock.mockImplementationOnce(() => Promise.resolve({ data: mock_filing_history }))

      await expect(fetchResourceList('company_01', 'filing-history')).resolves.toEqual(mock_filing_history)
      expect(mock).toHaveBeenCalledWith(url, { headers: { authorization: `Basic ${mock_key}` } })
    })
  })

  describe('search companies', () => {
    it('should return mock results', async () => {
      const url = `${mock_url}/search/companies`
      const { search } = require('../queries')
      const mock = jest.spyOn(axios, 'get')
      mock.mockImplementationOnce(() => Promise.resolve({ data: mock_search_result }))

      await expect(search('test')).resolves.toEqual(mock_search_result)
      expect(mock).toHaveBeenCalledWith(url, {
        headers: { authorization: `Basic ${mock_key}` },
        params: { q: 'test' }
      })
    })
  })
})
