/**
 * 游戏对象模块
 */

import { type ActionTypes, GameObjectTypes, ShapeTypes } from '../../config'
import type { Coordinate, Energy, ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import type { Action } from '../action'
import { BaseModule } from '../base'
import { type Context } from '../centralControlSystem'
import { RectangleShape, Shape, type ShapeOptions } from '../shape'
import { type Skill, type Trigger } from '../trigger'
// import { BulletGameObject, type BulletGameObjectOptions } from './Bullet'
// import { EnemyGameObject, type EnemyGameObjectOptions } from './Enemy'
// import { SkillGameObject, type SkillGameObjectOptions } from './Skill'
// import { TowerGameObject, type TowerGameObjectOptions } from './Tower'

export interface GameObjectOptions {
  id?: string
  type: GameObjectTypes
  shape?: Shape
  props?: Partial<GameObjectProps>
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

export interface GameObjectProps {
  speed: number
  healthPoint: Energy
  magicPoint: Energy
  physicalAttack: number
  magicalAttack: number
  physicalDefense: number
  magicalDefense: number
  attackSpeed: number
  releaseSpeed: number
}

export const createDefaultGameObjectProps = (): GameObjectProps => {
  return {
    speed: 0,
    healthPoint: { current: 1, max: 1 },
    magicPoint: { current: 1, max: 1 },
    physicalAttack: 1,
    magicalAttack: 1,
    physicalDefense: 1,
    magicalDefense: 1,
    attackSpeed: 1,
    releaseSpeed: 1
  }
}

export class GameObject extends BaseModule {
  id = createRandomId('GameObject')

  type = GameObjectTypes.DEFAULT
  shape!: Shape
  data = []
  triggerIds = new Set<string>()
  actions = new Map<ActionTypes, Action>()

  props = createDefaultGameObjectProps()

  skills = new Map<string, Skill>()

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

    if (options.props) {
      Object.assign(this.props, options.props)
    }
  }

  get isDead () {
    return this.props.healthPoint.current <= 0
  }

  init (context: Context) {
    context.gameObjects.set(this.id, this)
    this.update(context)
  }

  update (context: Context) {
    // 执行被动执行
    this.skills.forEach(skill => {
      skill.execSkill(context, skill)
    })

    this.shape.update()

    this.actions.forEach(action => {
      action.exec(this)
    })
  }

  destroy (context: Context) {
    const parentCollection = context.gameObjects

    let delKey = ''

    parentCollection.forEach((val, key) => {
      if (val === this) {
        delKey = key
      }
    })
    if (delKey) {
      return parentCollection.delete(delKey)
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

    // @todo
    // if (!triggerIds.has(trigger.id)) {
    //   trigger.actions.forEach(action => {
    //     this.loadAction(action.type, action)
    //   })
    // }

    triggerIds.add(trigger.id)
  }

  unbindTrigger (triggerId: string) {
    this.triggerIds.delete(triggerId)
  }

  learnSkill (skill: Skill) {
    skill.init(this)
    this.skills.set(skill.id, skill)
  }

  removeSkill (skill: Skill | string) {
    this.skills.delete(typeof skill === 'string' ? skill : skill.id)
  }

  moveTo (target: GameObject) {
    const {
      shape: {
        midpoint: { x: x1, y: y1 }
      },
      props: { speed }
    } = this
    const {
      shape: {
        midpoint: { x: x2, y: y2 }
      }
    } = target

    if (x1 === x2 && y1 === y2) {
      return
    }

    const vectorX = x2 - x1
    const vectorY = y2 - y1
    const magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY)

    const unitVectorX = vectorX / magnitude
    const unitVectorY = vectorY / magnitude

    const newX = speed * unitVectorX
    const newY = speed * unitVectorY

    this.shape.setMidpoint(x1 + newX, y1 + newY)
  }

  /**
   * 能量消耗/增加
   */
  doConsume (type: 'magicPoint' | 'healthPoint', value: number, action: 'increase' | 'decrease' = 'decrease') {
    const { props: { magicPoint, healthPoint } } = this

    const base = action === 'increase' ? 1 : -1

    switch (type) {
      case 'magicPoint':
        magicPoint.current = Math.min(magicPoint.max, Math.max(0, magicPoint.current + base * value))
        break
      case 'healthPoint':
        healthPoint.current = Math.min(healthPoint.max, Math.max(0, healthPoint.current + base * value))
        break
    }
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
