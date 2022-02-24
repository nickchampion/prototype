import mongoose from 'mongoose'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
import mongoosePaginate from 'mongoose-paginate-v2'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import mongooseLeanMethods from 'mongoose-lean-methods'
import mongooseLeanId from 'mongoose-lean-id'
import { logger } from '../utils'

const DB_HOST = process.env.DB_HOST
const DB_NAME = process.env.DB_NAME
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_AUTO_INDEX = !!process.env.DB_AUTO_INDEX

// cache database connection
let db_cache = null

// global plugin
mongoose.plugin(aggregatePaginate)
mongoose.plugin(mongoosePaginate)
mongoose.plugin(mongooseLeanVirtuals)
mongoose.plugin(mongooseLeanMethods)
mongoose.plugin(mongooseLeanId)

// global options
mongoose.set('useUnifiedTopology', true)
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', true)

interface dbOptions {
  pool_size?: number
}

const connectToMongoose = (options?: dbOptions): Promise<mongoose.Connection> => {
  return new Promise((resolve, reject) => {
    const is_test_env = process.env.NODE_ENV === 'test'

    mongoose.connection
      // interceptors
      .on('error', error => {
        logger.error({
          message: 'MongoDB: Error occurred whilst trying to connect to MongoDB.',
          error
        })
        return reject(error)
      })
      .once('open', () => {
        mongoose.connections.forEach(info =>
          logger.verbose(`MongoDB: Connected to ${info.host}:${info.port}/${info.name}`)
        )
        logger.verbose('MongoDB: New connection')
        return resolve(db_cache)
      })

    if (db_cache) {
      logger.verbose('MongoDB: Cached connection')
      return resolve(db_cache)
    }

    if (is_test_env) {
      // this check is to determine between core tests and service tests (services pass DB_HOST core doesn't)
      if (DB_HOST) {
        db_cache = mongoose.connect(DB_HOST, {
          dbName: DB_NAME,
          keepAliveInitialDelay: 300000,
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          poolSize: options?.pool_size ?? 2,
          autoIndex: DB_AUTO_INDEX
        })
      }
    } else {
      db_cache = mongoose.connect(DB_HOST, {
        dbName: DB_NAME,
        user: DB_USERNAME,
        pass: DB_PASSWORD,
        connectTimeoutMS: 6000,
        serverSelectionTimeoutMS: 6000,
        socketTimeoutMS: 45000,
        poolSize: options?.pool_size ?? 2,
        autoIndex: DB_AUTO_INDEX
      })
    }
  })
}

export const DEFAULT_OPTS = {
  toJSON: {
    virtuals: true,
    getters: true,
    transform: function (doc, ret, options) {
      ret.id = ret._id.toHexString()
      delete ret.__v
      delete ret._id
      return ret
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret, options) {
      ret.id = ret._id
      delete ret.__v

      return ret
    }
  },
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  setDefaultsOnInsert: true
}

export const baseSchema = (schema: Record<string, unknown>, options?: Record<string, unknown>) => {
  return new mongoose.Schema(
    {
      org_id: {
        type: String,
        required: true
      },
      country_id: {
        type: String,
        required: true
      },
      ...schema
    },
    {
      ...DEFAULT_OPTS,
      ...options
    }
  )
}

export { connectToMongoose }
