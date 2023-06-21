/**
 * 游戏对象模块
 */

import { type ActionTypes, GameObjectTypes, ShapeTypes } from '../config'
import type { Coordinate, ImageResource } from '../types'
import type { Action } from './action'
import { BaseModule } from './base'
import { RectangleShape, Shape, type ShapeOptions } from './shape'
import type { Trigger } from './trigger'

export interface GameObjectOptions {
  type: GameObjectTypes
  shape: Shape
}

export class GameObject extends BaseModule {
  type = GameObjectTypes.DEFAULT
  shape!: Shape
  data = []
  triggerIds = new Set<string>()
  actions = new Map<ActionTypes, Action>()
  parentCollection?: Map<string, GameObject>

  constructor (options: GameObjectOptions) {
    if (new.target === GameObject) {
      throw new Error('Cannot instantiate GameObject')
    }

    super()
    Object.assign(this, options)
  }

  static create (type: GameObjectTypes.GLOBAL): GameObject
  static create (type: GameObjectTypes.POINT, point: Coordinate): GameObject
  static create (type: GameObjectTypes.AREA, shapeOptions: ShapeOptions, models?: ImageResource[]): GameObject
  static create (type: GameObjectTypes.TOWER, shapeOptions: ShapeOptions, models?: ImageResource[]): GameObject
  static create (type: GameObjectTypes.ENEMY, shapeOptions: ShapeOptions, models?: ImageResource[]): GameObject
  static create (type: GameObjectTypes, ...args: unknown[]): GameObject | null {
    switch (type) {
      case GameObjectTypes.GLOBAL:
        return new GlobalGameObject()
      case GameObjectTypes.POINT:
        return new PointGameObject(args[0] as Coordinate)
      case GameObjectTypes.AREA:
        return new AreaGameObject(args[0] as ShapeOptions, args[1] as ImageResource[])
      case GameObjectTypes.TOWER:
        return new TowerGameObject(args[0] as ShapeOptions, args[1] as ImageResource[])
      case GameObjectTypes.ENEMY:
        return new EnemyGameObject(args[0] as ShapeOptions, args[1] as ImageResource[])
      default:
        return null
    }
  }

  init (parentCollection: Map<string, GameObject>) {
    if (parentCollection) {
      this.parentCollection = parentCollection
    }
    this.update()
  }

  update () {
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
      }
    } = this
    const {
      shape: {
        midpoint: { x: x2, y: y2 }
      }
    } = target

    /**
     * @todo - 需要计算速度
     */
    const speed = 10

    if (x1 === x2 && y1 === y2) {
      return
    }

    if (x1 === x2) {
      this.shape.setVelocity(
        x1,
        y1 > y2
          ? Math.max(y2, y1 - speed)
          : Math.min(y2, y1 + speed)
      )

      return
    }

    if (y1 === y2) {
      this.shape.setVelocity(
        x1 > x2
          ? Math.max(x2, x1 - speed)
          : Math.min(x2, x1 + speed),
        y1
      )

      return
    }

    this.shape.setVelocity(
      x1 > x2
        ? Math.max(x2, x1 - speed)
        : Math.min(x2, x1 + speed),
      y1 > y2
        ? Math.max(y2, y1 - speed)
        : Math.min(y2, y1 + speed)
    )
  }
}

// 全局对象
export class GlobalGameObject extends GameObject {
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
  constructor (point: Coordinate) {
    super({
      type: GameObjectTypes.POINT,
      shape: new Shape({
        type: ShapeTypes.POINT,
        width: 1,
        height: 1,
        midpoint: point
      })
    })
  }
}

// 区域对象
export class AreaGameObject extends GameObject {
  constructor (options: Omit<ShapeOptions, 'type'>, models: ImageResource[] = []) {
    super({
      type: GameObjectTypes.AREA,
      shape: new RectangleShape(options, models)
    })
  }
}

// 塔对象
export class TowerGameObject extends GameObject {
  constructor (options: Omit<ShapeOptions, 'type'>, models: ImageResource[] = []) {
    super({
      type: GameObjectTypes.TOWER,
      shape: new RectangleShape(options, models)
    })
  }
}

// 敌人对象
export class EnemyGameObject extends GameObject {
  constructor (options: ShapeOptions, models: ImageResource[] = []) {
    super({
      type: GameObjectTypes.ENEMY,
      shape: new RectangleShape(options, models)
    })
  }
}
