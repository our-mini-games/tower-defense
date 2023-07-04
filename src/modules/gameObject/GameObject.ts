/**
 * 游戏对象模块
 */

import { type ActionTypes, GameObjectTypes, ShapeTypes } from '../../config'
import type { Coordinate, ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import type { Action } from '../action'
import { BaseModule } from '../base'
import { RectangleShape, Shape, type ShapeOptions } from '../shape'
import type { Trigger } from '../trigger'
// import { BulletGameObject, type BulletGameObjectOptions } from './Bullet'
// import { EnemyGameObject, type EnemyGameObjectOptions } from './Enemy'
// import { SkillGameObject, type SkillGameObjectOptions } from './Skill'
// import { TowerGameObject, type TowerGameObjectOptions } from './Tower'

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

  // static create (type: GameObjectTypes.GLOBAL): GameObject
  // static create (type: GameObjectTypes.POINT, pointObjectOptions: PointGameObjectOptions): GameObject
  // static create (type: GameObjectTypes.AREA, areaObjectOptions: AreaGameObjectOptions): GameObject
  // static create (type: GameObjectTypes.TOWER, towerObjectOptions: TowerGameObjectOptions): GameObject
  // static create (type: GameObjectTypes.ENEMY, enemyObjectOptions: EnemyGameObjectOptions): GameObject
  // static create (type: GameObjectTypes.SKILL, skillObjectOptions: SkillGameObjectOptions): GameObject
  // static create (type: GameObjectTypes.BULLET, bulletObjectOptions: BulletGameObjectOptions): GameObject
  // static create (type: GameObjectTypes, ...args: unknown[]): GameObject | null {
  //   switch (type) {
  //     case GameObjectTypes.GLOBAL:
  //       return new GlobalGameObject()
  //     case GameObjectTypes.POINT:
  //       return new PointGameObject(args[0] as PointGameObjectOptions)
  //     case GameObjectTypes.AREA:
  //       return new AreaGameObject(args[0] as AreaGameObjectOptions)
  //     case GameObjectTypes.TOWER:
  //       return new TowerGameObject(args[0] as TowerGameObjectOptions)
  //     case GameObjectTypes.ENEMY:
  //       return new EnemyGameObject(args[0] as EnemyGameObjectOptions)
  //     case GameObjectTypes.SKILL:
  //       return new SkillGameObject(args[0] as SkillGameObjectOptions)
  //     case GameObjectTypes.BULLET:
  //       return new BulletGameObject(args[0] as BulletGameObjectOptions)
  //     default:
  //       return null
  //   }
  // }

  init (parentCollection: Map<string, GameObject>) {
    if (parentCollection) {
      this.parentCollection = parentCollection
      parentCollection.set(this.id, this)
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
    const speed = 2

    if (x1 === x2 && y1 === y2) {
      return
    }

    if (x1 === x2) {
      this.shape.setMidpoint(
        x1,
        y1 > y2
          ? Math.max(y2, y1 - speed)
          : Math.min(y2, y1 + speed)
      )

      return
    }

    if (y1 === y2) {
      this.shape.setMidpoint(
        x1 > x2
          ? Math.max(x2, x1 - speed)
          : Math.min(x2, x1 + speed),
        y1
      )

      return
    }

    this.shape.setMidpoint(
      x1 > x2
        ? Math.max(x2, x1 - speed)
        : Math.min(x2, x1 + speed),
      y1 > y2
        ? Math.max(y2, y1 - speed)
        : Math.min(y2, y1 + speed)
    )
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
