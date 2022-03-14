import mongoose from 'mongoose'
import { connect } from './connect'
import { Context } from '@hectare/platform.components.context'
import * as mongodb from './api'
import { try_execute_async } from '@hectare/platform.components.utils'

export class SessionAction {
  fn: (context: Context) => Promise<void>
  name: string
}

export class Session {
  context: Context
  session: mongoose.ClientSession
  veto: boolean
  commit_actions: SessionAction[]
  rollback_actions: SessionAction[]
  commit_on_get: boolean

  public constructor(context: Context) {
    this.context = context
    this.commit_on_get = false
    this.veto = false
    this.commit_actions = []
    this.rollback_actions = []
  }

  public async initialise(): Promise<void> {
    const connection = await connect()
    this.session = await connection.startSession()
    this.session.startTransaction()
  }

  public add_commit_action(action: SessionAction): void {
    this.commit_actions.push(action)
  }

  public add_rollback_action(action: SessionAction): void {
    this.rollback_actions.push(action)
  }

  public async abort(): Promise<void> {
    await this.session.abortTransaction()
    this.veto = true
  }

  public async commit(): Promise<void> {
    if (this.veto) return

    try {
      await this.context.profiler.measure('ct', async () => await this.session.commitTransaction())
      this.session.endSession()
    } catch (e) {
      if (this.rollback_actions.length) {
        for (const action of this.rollback_actions) {
          await try_execute_async(
            () => this.context.profiler.measure(action.name, async () => action.fn(this.context)),
            error => {
              console.log(error) //TODO: logging
              return null
            }
          )
        }
      }
      throw e
    }

    for (const action of this.commit_actions) {
      await try_execute_async(
        () => this.context.profiler.measure(action.name, async () => action.fn(this.context)),
        error => {
          console.log(error)
          return null
        }
      )
    }

    this.commit_actions = []
    this.rollback_actions = []
  }

  public use<T>(model: mongoose.Model<T>): mongodb.MongoApi<T> {
    return new mongodb.MongoApi<T>(model, this.session)
  }
}
