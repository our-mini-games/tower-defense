/**
 * 游戏对象模块
 */

import { type ActionTypes, GameObjectTypes, ShapeTypes } from '../../config'
import type { Coordinate, ImageResource } from '../../types'
import { createRandomId, move } from '../../utils/tools'
import type { Action } from '../action'
import { BaseModule } from '../base'
import { RectangleShape, Shape, type ShapeOptions } from '../shape'
import type { Skill, Trigger } from '../trigger'

export interface GameObjectOptions {
  id?: string
  type: GameObjectTypes
  shape?: Shape
}

export interface PointGameObjectOptions {
  id?: string
  point: Coordinate
}

export interface AreaGameObjectOptions {
  id?: string
  shapeOptions: Omit<ShapeOptions, 'type'>
  models?: ImageResource[]
}

export class GameObject extends BaseModule {
  id = createRandomId('GameObject')

  type = GameObjectTypes.DEFAULT
  shape!: Shape
  data = []
  triggerIds = new Set<string>()
  actions = new Map<ActionTypes, Action>()
  parentCollection?: Map<string, GameObject>

  skills = new Set<Skill>()

  speed = 2

  constructor (options: GameObjectOptions) {
    if (new.target === GameObject) {
      throw new Error('Cannot instantiate GameObject')
    }

    super()
    Object.assign(this, options)

    if (options.id) {
      this.id = options.id
    }
  }

  init (parentCollection: Map<string, GameObject>) {
    if (parentCollection) {
      this.parentCollection = parentCollection
      parentCollection.set(this.id, this)
    }
    this.update(parentCollection)
  }

  update (..._args: unknown[]) {
    this.skills.forEach(skill => {
      skill.fire(this)
    })

    this.shape.update()

    this.actions.forEach(action => {
      action.exec(this)
    })
  }

  destroy () {
    const { parentCollection } = this

    if (parentCollection) {
      let delKey = ''

      parentCollection.forEach((val, key) => {
        if (val === this) {
          delKey = key
        }
      })
      if (delKey) {
        return parentCollection.delete(delKey)
      }
    }

    return false
  }

  loadAction (actionName: ActionTypes, action: Action) {
    this.actions.set(actionName, action)
  }

  unloadAction (actionName: ActionTypes) {
    this.actions.delete(actionName)
  }

  bindTrigger (trigger: Trigger) {
    const { triggerIds } = this

    if (!triggerIds.has(trigger.id)) {
      trigger.actions.forEach(action => {
        this.loadAction(action.type, action)
      })
    }

    triggerIds.add(trigger.id)
  }

  unbindTrigger (triggerId: string) {
    this.triggerIds.delete(triggerId)
  }

  moveTo (target: GameObject) {
    const {
      shape: {
        midpoint: { x: x1, y: y1 }
      },
      speed
    } = this
    const {
      shape: {
        midpoint: { x: x2, y: y2 }
      }
    } = target

    if (x1 === x2 && y1 === y2) {
      return
    }

    const { x, y } = move(x1, y1, x2, y2, speed)

    this.shape.setMidpoint(x, y)

    // if (x1 === x2) {
    //   this.shape.setMidpoint(
    //     x1,
    //     y1 > y2
    //       ? Math.max(y2, y1 - speed)
    //       : Math.min(y2, y1 + speed)
    //   )

    //   return
    // }

    // if (y1 === y2) {
    //   this.shape.setMidpoint(
    //     x1 > x2
    //       ? Math.max(x2, x1 - speed)
    //       : Math.min(x2, x1 + speed),
    //     y1
    //   )

    //   return
    // }

    // this.shape.setMidpoint(
    //   x1 > x2
    //     ? Math.max(x2, x1 - speed)
    //     : Math.min(x2, x1 + speed),
    //   y1 > y2
    //     ? Math.max(y2, y1 - speed)
    //     : Math.min(y2, y1 + speed)
    // )
  }

  static isEnemy (gameObject: GameObject) {
    return gameObject.type === GameObjectTypes.ENEMY
  }
}

// 全局对象
export class GlobalGameObject extends GameObject {
  id = createRandomId('GlobalGameObject')

  constructor () {
    super({
      type: GameObjectTypes.GLOBAL,
      shape: new Shape({
        type: ShapeTypes.POINT,
        midpoint: { x: 0, y: 0 },
        width: 1,
        height: 1
      })
    })
  }
}

// 点对象（坐标对象）
export class PointGameObject extends GameObject {
  id = createRandomId('PointGameObject')

  constructor ({
    id,
    point
  }: PointGameObjectOptions) {
    super({
      type: GameObjectTypes.POINT,
      shape: new Shape({
        type: ShapeTypes.POINT,
        width: 1,
        height: 1,
        midpoint: point
      })
    })

    if (id) {
      this.id = id
    }
  }
}

// 区域对象
export class AreaGameObject extends GameObject {
  id = createRandomId('AreaGameObject')

  constructor ({
    id,
    shapeOptions,
    models = []
  }: AreaGameObjectOptions) {
    super({
      type: GameObjectTypes.AREA,
      shape: new RectangleShape(shapeOptions, models)
    })

    if (id) {
      this.id = id
    }
  }
}
