/**
 * 动作模块
 */

import { ActionTypes } from '../config'
import { NOOP } from '../types'
import { createRandomId } from '../utils/tools'
import { type GameObject } from './gameObject'

interface ActionCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): void
}

// interface CreateTarget {
//   type: GameObjectTypes
//   shapeOptions: ShapeOptions
//   models?: ImageResource[]
// }

export interface ActionOptions<T extends ActionTypes | unknown = unknown> {
  type: T
  source?: GameObject
  target?: T extends ActionTypes.CREATE
    ? (gameObject: GameObject) => void
    : GameObject
  callback?: ActionCallback
}

export interface IntervalActionOptions<T extends ActionTypes | unknown = unknown> extends ActionOptions<T> {
  interval: number
  immediate?: boolean
  limitTimes?: number
}

export class Action<T extends ActionTypes | unknown = unknown> {
  id = createRandomId('Action')

  type!: ActionTypes
  source?: GameObject
  target?: ActionOptions['target']

  callback?: ActionCallback = NOOP

  constructor (options: ActionOptions<T>) {
    Object.assign(this, options)
  }

  execCheck (): boolean {
    return true
  }

  exec (source?: GameObject) {
    if (!this.execCheck()) return

    if (source) {
      this.source = source
    }

    switch (this.type) {
      case ActionTypes.MOVE_TO:
        if (this.source && this.target) {
          this.source.moveTo(this.target)
        }
        break
      case ActionTypes.DESTROY:
        console.log('destroy')
        // @todo
        // if (this.source) {
        //   this.source.destroy()
        // }
        break
      case ActionTypes.CREATE:
        if (typeof this.target === 'function') {
          // @ts-expect-error it-must-be-here
          this.target(this.source)
        }
        break
      case ActionTypes.DEFAULT:
      default:
        if (typeof this.target === 'function') {
          // @ts-expect-error it-must-be-here
          this.target(this.source)
        }
        break
    }
  }
}

/**
 * Interval Action
 */
export class IntervalAction<T extends ActionTypes | unknown = unknown> extends Action<T> {
  protected interval = 0
  protected immediate = false
  protected lastTime = new Date().getTime()

  constructor ({ interval, immediate, ...actionOptions }: IntervalActionOptions<T>) {
    super(actionOptions)

    this.interval = interval
    this.immediate = !!immediate

    if (immediate) {
      this.lastTime = -Infinity
    }
  }

  execCheck () {
    const currentTime = performance.now()

    if (currentTime - this.lastTime > this.interval) {
      this.lastTime = currentTime

      return true
    }

    return false
  }
}
