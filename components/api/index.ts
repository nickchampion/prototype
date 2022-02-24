import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import express, { NextFunction, Application, Router } from 'express'
import 'express-async-errors'
import cors, { CorsOptions } from 'cors'
import useragent from 'express-useragent'
import helmet from 'helmet'
import serverless from 'serverless-http'
import { errorHandler } from '../error-handling/middleware/error-handler.middleware'
import { initialiseAxiosInterceptors } from '../error-handling/hooks/axios-interceptors'
import axios from 'axios'
import { ApiKeyDoc, ApplicationDoc, GroupDoc, OrganisationDoc, Services, UserDoc } from '../common'
import { middleware } from 'express-openapi-validator'
import { OpenApiErrorHandler } from '../error-handling/middleware/open-api-error-handler.middleware'
import { connectToDB } from '../middleware/db'
import { commonRequestFormatter } from '../middleware/common-request-formatter'
import { commonResponseFormatter } from '../middleware/common-response-formatter'
import { paginationOptions } from '../middleware/pagination-options'
import { checkMaintenanceMode } from '../middleware'
import { PaginationRequestOptions } from '../collaboration/common/v1/requests/pagination.interface'
import { ProfileTypes } from '../enumerations'
import { Types } from 'mongoose'
import { logUserAgentInfo } from '../middleware/user-agent'
import { requestInfo } from '../middleware/request-info'
import { logger } from '../utils/index'

const isSentryEnabled = () => process.env.ENABLE_SENTRY_REPORTING?.toUpperCase() === 'TRUE'

const initSentry = () => {
  logger.verbose('Enabling Sentry tracking to the DSN...')
  Sentry.init({
    dsn: 'https://fce6ee1bb57441728d6a6266555d5dde@o515766.ingest.sentry.io/5624536',
    tracesSampleRate: 1.0,
    environment: process.env.STAGE || 'local',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true })
    ]
  })

  Sentry.configureScope(scope => {
    scope.setTag('region', process.env.AWS_REGION)
    scope.setTag('function-name', process.env.AWS_LAMBDA_FUNCTION_NAME)
  })
}

// creates a type which application can be assigned to but will remove the given keys
// this is needed to prevent direct assignment to api.app.get etc as it disrupts the correct middleware structures

type ReadonlyExpressApp = Omit<Application, 'get' | 'post' | 'delete' | 'put' | 'use'>
interface Options {
  spec?: string
  cors?: boolean
  cors_options?: CorsOptions
  logger?: boolean
  bodyparser?: boolean
  helmet?: boolean
  useragent?: boolean
  async_errors?: boolean
  axios?: boolean
  common_request?: boolean
  common_response?: boolean
  pagination_enabled?: boolean
  enable_db_connection?: boolean
  maintenance_mode?: boolean
}

export class Api {
  private _app: Application
  private _options: Options = {
    spec: undefined,
    cors: true,
    cors_options: undefined,
    bodyparser: true,
    useragent: true,
    helmet: true,
    async_errors: true,
    axios: true,
    common_request: true,
    common_response: true,
    pagination_enabled: true,
    enable_db_connection: true,
    maintenance_mode: false
  }
  private _axiosInterceptorConfiguration: number

  public router: Router
  public handler: any
  public middlewares: Application
  public afterwares: Router

  // if your looking here because you failed to add a route to app use api.router
  // for adding middleware use api.middleware
  public get app(): ReadonlyExpressApp {
    return this._app
  }

  constructor(options?: Options) {
    // override options
    if (options) {
      this._options = { ...this._options, ...options }
    }

    // init express app
    this._app = express()
    if (isSentryEnabled()) {
      initSentry()
      this._app.use(Sentry.Handlers.requestHandler() as express.RequestHandler)
      this._app.use(Sentry.Handlers.tracingHandler() as express.RequestHandler)
    }

    // created a sub app containing middleware to keep middlewares ordered regardless of assignment location
    this.middlewares = express()
    this._app.use(this.middlewares)

    // init express additonal middleware
    if (this._options.maintenance_mode) this.enableMaintenanceMode()
    if (this._options.cors) this.enableCors()
    if (this._options.helmet) this.enableHelmet()
    if (this._options.bodyparser) this.enableBodyParser()
    if (this._options.axios) this.enableAxiosInterceptors()
    if (this._options.enable_db_connection) this.enableDbConnection()
    if (this._options.common_request) this.enableCommonRequest()
    if (this._options.pagination_enabled) this.enablePagination()
    if (this._options.common_response) this.enableCommonResponse()
    if (this._options.spec) this.enableValidator()
    if (this._options.useragent) this.enableUseragent()
    this.enableRequestInfo()

    // create and assign routes, (maintains the correct ordering of middlewares -> routes -> afterwares)
    this.router = Router()
    this._app.use(this.router)

    // created sub apps router allowing individual services to handle afterware, these could use next or return before default error handling
    this.afterwares = express.Router()

    this.router.use((req, res, next: NextFunction) => {
      res.on('finish', () => {
        // access the middlewares on the router stack and get them out as functions
        this.afterwares.stack.forEach(afterware => afterware.__handle(req, res, next))
      })
      next()
    })

    if (isSentryEnabled()) {
      this._app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)
    }
    // assign the error handler last (afterware), with the router this should now be in the correct place in the stack
    this._app.use(errorHandler)
  }

  private enableValidator() {
    const valdate_spec: 'failing' | boolean = 'failing'
    // if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev') {
    //   valdate_spec = false
    // }

    // validate request using the openapi specification

    this.middlewares.use(
      middleware({
        apiSpec: this._options.spec,
        validateRequests: { removeAdditional: valdate_spec }
      })
    )

    this.middlewares.use(OpenApiErrorHandler)
  }

  private enableMaintenanceMode() {
    this.middlewares.use(checkMaintenanceMode)
  }

  private enableUseragent() {
    this.middlewares.use(useragent.express())
    this.middlewares.use(logUserAgentInfo)
  }

  private enableRequestInfo() {
    this.middlewares.use(requestInfo)
  }

  private enableCors() {
    this.middlewares.use(cors(this._options.cors_options))
  }

  private enableHelmet() {
    this.middlewares.use(helmet())
  }

  private enableBodyParser() {
    this.middlewares.use(express.json({ limit: '50mb' }))
    this.middlewares.use(express.text({ limit: '50mb' }))
    this.middlewares.use(express.urlencoded({ extended: false }))
  }

  private enableCommonResponse() {
    // formats all responses including errors to include status etc
    this.middlewares.use(commonResponseFormatter)
  }

  // spawns DB connection
  private enableDbConnection() {
    this.middlewares.use(connectToDB)
  }

  private enableCommonRequest() {
    // formats body data based ob querystring
    this.middlewares.use(commonRequestFormatter)
  }
  private enablePagination() {
    this.middlewares.use(paginationOptions)
  }

  private enableAxiosInterceptors(): void {
    this._axiosInterceptorConfiguration = initialiseAxiosInterceptors()
  }

  // this can be used in dev and tests to deactive custom error handling they will still fallback to the custom Unexpected error
  // if you are trying to check axios error messages try-catch the errors straight from the axios call before they hit the error handler
  disableAxiosErrorHandling(): void {
    axios.interceptors.response.eject(this._axiosInterceptorConfiguration)
  }

  // wraps the api up into a serverless handler
  serverless(): serverless.Handler {
    return serverless(this._app, {
      request: function (req, event, context) {
        context.callbackWaitsForEmptyEventLoop = false
        req.event = event
        req.context = context
      }
    })
  }
}

// extend Express -> Request to include current user/application/organisation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDoc
      application?: ApplicationDoc
      api_access?: ApiKeyDoc
      organisation?: OrganisationDoc
      pagination_options?: PaginationRequestOptions
      groups?: Array<GroupDoc>
      permissions?: Services
      profiles?: { types: ProfileTypes[]; ids: Types.ObjectId[] }
      flags?: {
        internal?: boolean
        verified_api_access?: boolean
      }
    }
  }
}
