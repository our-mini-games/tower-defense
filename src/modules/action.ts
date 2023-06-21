/**
 * 动作模块
 */

import { ActionTypes, type GameObjectTypes } from '../config'
import type { ImageResource } from '../types'
import { createRandomId } from '../utils/tools'
import { GameObject } from './gameObject'
import type { ShapeOptions } from './shape'

interface ActionCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): void
}

interface CreateTarget {
  type: GameObjectTypes
  shapeOptions: ShapeOptions
  models?: ImageResource[]
}

export interface ActionOptions<T extends ActionTypes | unknown = unknown> {
  type: T
  source?: GameObject
  target?: T extends ActionTypes.CREATE
    ? CreateTarget
    : GameObject
  callback?: ActionCallback
}

export class Action<T extends ActionTypes | unknown = unknown> {
  id = createRandomId('Action_')

  type!: ActionTypes
  source?: GameObject
  target?: ActionOptions['target']

  callback?: ActionCallback

  constructor (options: ActionOptions<T>) {
    Object.assign(this, options)
  }

  exec (source?: GameObject) {
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
        if (this.source) {
          this.source.destroy()
        }
        break
      case ActionTypes.CREATE:
        if (this.target) {
          const { type, shapeOptions } = this.target as unknown as CreateTarget
          const gameObject = GameObject.create(
            type as GameObjectTypes.ENEMY,
            shapeOptions
          )

          this.callback?.(gameObject, this)
        }
        break
      default:
        break
    }
  }
}
