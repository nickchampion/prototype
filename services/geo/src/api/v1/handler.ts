import { resolve } from 'path'
import {
  Api,
  authKey,
  mongoIdValidator,
  PermissionsMiddlewaresGenerator,
  ServicesEnum,
  ProfileTypes,
  Permissions,
  authToken,
  RoleBasedRouter
} from '@hectare/core'
import { deepPing, ping } from './health'
import { replayEvent } from './event-control'
import {
  createGeoPointController,
  updateGeoPointController,
  readAllGeoPointController,
  readGeoPointController,
  deleteGeoPointController
} from './geo-point'
import {
  createGeoLocationController,
  readGeoLocationController,
  readAllGeoLocationController,
  deleteGeoLocationController,
  updateGeoLocationController,
  getGeoLocationTypes
} from './geo-location'
import { getAddress, searchAddress } from './address'
import {
  createLiveLocation,
  getDebugLog,
  getDebugLogs,
  getLiveLocation,
  getLiveLocations,
  getLiveLocationByDriverId,
  createGeoDebugLog
} from './geo-live-location'
import { createGeoLocationInternalController } from './geo-location/internal/create-geo-location-internal'
import { getRouteDirections, getRouteStaticImage, createRouteDistances } from './geo-routing'
import { getCountries, getCountry, editCountry, createCountry } from './country'

// CONSTANTS
const LAMBDA_TASK_ROOT = process.env.LAMBDA_TASK_ROOT || ''
const IS_OFFLINE = process.env.IS_OFFLINE || false

let spec = resolve(LAMBDA_TASK_ROOT, 'src/api/v1/openapi.yml')
if (IS_OFFLINE) spec = `${__dirname}/openapi.yml`

export const api = new Api({
  spec
})

// Permissions groups
const ReadPermissions = PermissionsMiddlewaresGenerator(
  [Permissions.READ],
  [ServicesEnum.logistics, ServicesEnum.billing, ServicesEnum.logistics_quick_quotes],
  [ProfileTypes.organiser, ProfileTypes.carrier, ProfileTypes.driver]
)
const DeletePermissions = PermissionsMiddlewaresGenerator(
  [Permissions.DELETE],
  [ServicesEnum.logistics],
  [ProfileTypes.organiser, ProfileTypes.carrier]
)
const CreatePermissions = PermissionsMiddlewaresGenerator(
  [Permissions.WRITE],
  [ServicesEnum.logistics, ServicesEnum.logistics_quick_quotes],
  [ProfileTypes.organiser, ProfileTypes.carrier]
)
const UpdatePermissions = PermissionsMiddlewaresGenerator(
  [Permissions.WRITE, Permissions.READ],
  [ServicesEnum.logistics, ServicesEnum.logistics_quick_quotes],
  [ProfileTypes.organiser, ProfileTypes.carrier]
)
const hasInternalSuper = PermissionsMiddlewaresGenerator(
  [Permissions.SUPER],
  [ServicesEnum.default],
  [ProfileTypes.internal]
)

// ROUTES
api.router.get('/geo/v1/health/ping', authKey, ping)
api.router.get('/geo/v1/health/deep/ping', authKey, deepPing)

api.router.get('/geo/v1/country', authKey, getCountries)
api.router.post('/geo/v1/country', authKey, authToken, hasInternalSuper, createCountry)
api.router.put('/geo/v1/country/:id', authKey, authToken, hasInternalSuper, editCountry)
api.router.get('/geo/v1/country/:id', authKey, authToken, getCountry)

api.router.post('/geo/v1/geo-point', authKey, authToken, createGeoPointController)
api.router.get('/geo/v1/geo-point/:id', authKey, authToken, mongoIdValidator(['id']), readGeoPointController)
api.router.delete(
  '/geo/v1/geo-point/:id',
  authKey,
  authToken,
  mongoIdValidator(['id']),
  authKey,
  authToken,
  deleteGeoPointController
)
api.router.get('/geo/v1/geo-point', authKey, authToken, readAllGeoPointController)
api.router.put('/geo/v1/geo-point/:id', authKey, authToken, updateGeoPointController)

api.router.get(
  '/geo/v1/geo-location/:id',
  mongoIdValidator(['id']),
  authKey,
  authToken,
  ReadPermissions,
  readGeoLocationController
)
api.router.delete(
  '/geo/v1/geo-location/:id',
  mongoIdValidator(['id']),
  authKey,
  authToken,
  DeletePermissions,
  deleteGeoLocationController
)
api.router.put(
  '/geo/v1/geo-location/:id',
  mongoIdValidator(['id']),
  authKey,
  authToken,
  UpdatePermissions,
  updateGeoLocationController
)
api.router.post(
  '/geo/v1/geo-location',
  authKey,
  authToken,
  CreatePermissions,
  RoleBasedRouter([
    { INTERNAL: createGeoLocationInternalController },
    { CARRIER: createGeoLocationController },
    { ORGANISER: createGeoLocationController },
    { API_KEY: createGeoLocationController }
  ])
)
api.router.get('/geo/v1/geo-location', authKey, authToken, ReadPermissions, readAllGeoLocationController)

api.router.get('/geo/v1/geo-locations/types', authKey, authToken, ReadPermissions, getGeoLocationTypes)

api.router.post('/geo/v1/location/live', authKey, authToken, createLiveLocation)
api.router.post('/geo/v1/location/live/log', authKey, authToken, createGeoDebugLog)
api.router.get('/geo/v1/location/live', authKey, authToken, getLiveLocations)
api.router.get('/geo/v1/location/live/log', authKey, authToken, getDebugLogs)
api.router.get('/geo/v1/location/live/log/:id', authKey, authToken, getDebugLog)
api.router.get('/geo/v1/location/live/:id', authKey, authToken, getLiveLocation)
//// TEMP DISABLE AUTH
api.router.get('/geo/v1/location/live/driver/:id', getLiveLocationByDriverId)

api.router.get('/geo/v1/address', authKey, authToken, getAddress)
api.router.get('/geo/v1/address/search', authKey, authToken, searchAddress)

api.router.get('/geo/v1/route/static/:style/:overlay/:params/:size', authKey, authToken, getRouteStaticImage)
api.router.get('/geo/v1/route/directions/:coordinates', authKey, authToken, getRouteDirections)
api.router.post('/geo/v1/route/distances', authKey, authToken, createRouteDistances)

//// Internal Only
api.router.get(
  '/geo/v1/event-control/replay/:id',
  authKey,
  authToken,
  RoleBasedRouter([{ INTERNAL: replayEvent }])
)

export const handler = api.serverless()
