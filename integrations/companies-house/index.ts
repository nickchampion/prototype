import { fetchResource, fetchResourceList, search } from './queries'

enum RegisterTypes {
  'directors',
  'secretaries',
  'llp-members'
}

enum OrderBy {
  'appointed_on',
  'resigned_on',
  'surname'
}

/**
 * Get full company profile.
 * @param {string} company_number company number
 * @returns {object} company profile object or undefined if not found
 */
export const getCompanyProfile = async (company_number: string): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, 'profile')
}

/**
 * Get the company registers information.
 * @param {string} company_number company number
 * @returns {object} list of registers or undefined if company not fould
 */
export const getCompanyRegisters = async (company_number: string): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, 'registers')
}

/**
 * Company insolvency information.
 * @param {string} company_number company number
 * @returns {object} a list of insolvency cases or undefined if company not found
 */
export const getCompanyInsolvency = async (company_number: string): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, 'insolvency')
}

/**
 * Company exemptions information.
 * @param {string} company_number company number
 * @returns {object} a list of exemptions or undefined if company not found
 */
export const getCompanyExemptions = async (company_number: string): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, 'exemptions')
}

/**
 * List of charges for a company.
 * @param {string} company_number company number
 * @returns {object} a list of charge items or undefined if company not found
 */
export const getCompanyCharges = async (company_number: string): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, 'charges')
}

/**
 * Individual charge information for company.
 * @param {string} company_number company number
 * @param {string} charge_id id of charge
 * @returns {object} detailed object of a charge or undefined if company or charge not found
 */
export const getCompanyCharge = async (
  company_number: string,
  charge_id: string
): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, `charges/${charge_id}`)
}

/**
 * Get the filing history item of a company.
 * @param {string} company_number company number
 * @param {string} transaction_id filing history transaction id
 * @returns a transaction item or undefined if company or transaction not found
 */
export const getCompanyTransaction = async (
  company_number: string,
  transaction_id: string
): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, `filing-history/${transaction_id}`)
}

/**
 * List of uk-establishments companies.
 * @param {string} company_number company number
 * @returns a list of establishments the company has or undefined if company not found
 */
export const getCompanyEstablishments = async (company_number: string): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, 'uk-establishments')
}

/**
 * Get details of an individual company officer appointment.
 * @param {string} company_number company number
 * @param {string} appointment_id officer id
 * @returns officer information or undefined if company or officer not found
 */
export const getCompanyOfficer = async (
  company_number: string,
  appointment_id: string
): Promise<Record<string, unknown>> => {
  return await fetchResource(company_number, `appointments/${appointment_id}`)
}

/**
 * Get the filing history list of a company.
 * @param {string} company_number company number
 * @param {object} options pagination options
 * @returns {object} returns a list of transaction items or undefined if company not found
 */
export const searchCompanyFilingHistory = async (
  company_number: string,
  options?: {
    category?: string
    items_per_page?: number
    start_index?: number
  }
): Promise<Record<string, unknown>> => {
  return await fetchResourceList(company_number, 'filing-history', options)
}

/**
 * List of all company officers.
 * @param {string} company_number company number
 * @param {string} options pagination and search options
 * @returns {object} a list of officers or undefined if company not found
 */
export const searchCompanyOfficers = async (
  company_number: string,
  options?: {
    items_per_page?: number
    register_type?: RegisterTypes
    register_view?: boolean
    start_index?: number
    order_by?: OrderBy
  }
): Promise<Record<string, unknown>> => {
  return await fetchResourceList(company_number, 'filing-history', options)
}

/**
 * Search for companies by a given term.
 * @param {string} term the term used to search
 * @param {string} options pagination options
 * @returns {object} a list of companies
 */
export const searchCompanies = async (
  term: string,
  options?: {
    items_per_page?: number
    start_index?: number
  }
): Promise<Record<string, unknown>> => {
  return await search(term, options)
}
