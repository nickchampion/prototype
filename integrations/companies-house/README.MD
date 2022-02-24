# Documentation
This is a set of functions to retreive information from HMRC Companies House API.

For more information about the the API and the data it provides visit [Companies House API]([https://link](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference))

## Functions

### `getCompanyProfile(company_number: string)`

Get full company profile.

 * **Parameters:** `company_number` — `string` — company number
 * **Returns:** `object` — company profile object or undefined if not found

### `getCompanyRegisters(company_number: string)`

Get the company registers information.

 * **Parameters:** `company_number` — `string` — company number
 * **Returns:** `object` — list of registers or undefined if company not fould

### `getCompanyInsolvency(company_number: string)`

Company insolvency information.

 * **Parameters:** `company_number` — `string` — company number
 * **Returns:** `object` — a list of insolvency cases or undefined if company not found

### `getCompanyExemptions(company_number: string)`

Company exemptions information.

 * **Parameters:** `company_number` — `string` — company number
 * **Returns:** `object` — a list of exemptions or undefined if company not found

### `getCompanyCharges(company_number: string)`

List of charges for a company.

 * **Parameters:** `company_number` — `string` — company number
 * **Returns:** `object` — a list of charge items or undefined if company not found

### `getCompanyCharge (company_number: string, charge_id: string)`

Individual charge information for company.

 * **Parameters:**
   * `company_number` — `string` — company number
   * `charge_id` — `string` — id of charge
 * **Returns:** `object` — detailed object of a charge or undefined if company or charge not found

### `getCompanyTransaction(company_number: string, transaction_id: string)`

Get the filing history item of a company.

 * **Parameters:**
   * `company_number` — `string` — company number
   * `transaction_id` — `string` — filing history transaction id
 * **Returns:** `` — transaction item or undefined if company or transaction not found

### `getCompanyEstablishments(company_number: string)`

List of uk-establishments companies.

 * **Parameters:** `company_number` — `string` — company number
 * **Returns:** `` — list of establishments the company has or undefined if company not found

### `getCompanyOfficer(company_number: string, appointment_id: string)`

Get details of an individual company officer appointment.

 * **Parameters:** 
   * `company_number` — `string` — company number
   * `appointment_id` — `string` — officer id
 * **Returns:** `` — officer information or undefined if company or officer not found

### `searchCompanyFilingHistory( company_number: string, options?: Record<string, unknown>)`

Get the filing history list of a company.

 * **Parameters:**
   * `company_number` — `string` — company number
   * `options` — `object` — pagination options
 * **Returns:** `object` — returns a list of transaction items or undefined if company not found

### `searchCompanyOfficers( company_number: string, options?: Record<string, unknown>)`

List of all company officers.

 * **Parameters:**
   * `company_number` — `string` — company number
   * `options` — `string` — pagination and search options
 * **Returns:** `object` — a list of officers or undefined if company not found

### `searchCompanies(term: string, options?: Record<string, unknown>)`

Search for companies by a given term.

 * **Parameters:**
   * `term` — `string` — the term used to search
   * `options` — `string` — pagination options
 * **Returns:** `object` — a list of companies