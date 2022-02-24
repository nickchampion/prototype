# DVLA Intergration Library

The DVLA Library exposes two methods:

` dvlaLookupOne `
`dvlaLookupMany`

These two methods reach out to the DVLA API:
https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/v1.1.0-vehicle-enquiry-service.html#vehicle-enquiry-api

They will then return persist and return the response from the DVLA 

## Library API

`dvlaLookupOne( registrationNumber: String ) : Promise <DVLA Response>`

`dvlaLookupMany( [registrationNumber]: [String] ): Promise <[DVLA Response]>`

DVLA Response: https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/v1.1.0-vehicle-enquiry-service.html#tocSvehicle

### Parameters

* registrationNumber - must be of type string and follow the DVLA approved format 
  https://www.gov.uk/displaying-number-plates

### Examples

```javascript
const {dvlaLookupOne, dvlaLookupMany} = require('plat-core-libs/integrations/dvla')

try{
  const vehicle_information = await dvlaLookupOne("HK53BBY")
  console.log(vehicle_information.motExpiryDate)
  
  const multiple_vehicles_information = await dvlaLookupMany("HK53BBY", "HK53BBX")
  multiple_vehicles_information.forEach(vehicle => {
    console.log(vehicle.motExpiryDate)
  })
}
catch(e){
  console.error(e)
}

```



### Error Handling

Errors returned from the library take two forms

* Irrecoverable Errors -  Errors will be thrown
* Recoverable Errors - Errors will be returned within an object with metadata about there cause

Irrecoverable errors cover implementation failures such as wrong data being passed to method or incorrect configuration of environment variables and database connections.

Recoverable errors are when an attempt has failed for an expected reason while interacting with the DVLA api:
https://developer-portal.driver-vehicle-licensing.api.gov.uk/commonerrors.html#common-error-responses
when this occurs the consumer of the library will be given an error object matching the below format that can be used to inform the user. 

```javascript
const {dvlaLookupOne, dvlaLookupMany} = require('plat-core-libs/integrations/dvla')

try{
  const vehicle_information = await dvlaLookupOne("HK53BBY")
  if(vehicle_information.status === "Error"){
    console.log(vehicle_information)
    // handle failure case e.g. display message to user or re-request later
  }
  console.log(vehicle_information.motExpiryDate)
  
  const multiple_vehicles_information = await dvlaLookupMany("HK53BBY", "HK53BBX")
  const issues_querying = multiple_vehicles_information.filter(
    vehicle => vehicle_information.status === 	"Error");
  // handle failure cases e.g. re-request later or ask user to check submissions
}
catch(e){
  console.error("i've caught an irrecoverable error", e)
  // Something is wrong either with the implementation or the envrioment the library is being used in
}
```



### Recoverable Error Format

The error message will always return with a status of `"Error"` and will contain information if possible of the fields related to the error along with a standardised message detailing what went wrong.

```Javascript
{
  status: 'Error',
  message: 'Vehicle was not found by the DVLA',
  fields: { regNumber: 'ER19BAD' }
}
```

