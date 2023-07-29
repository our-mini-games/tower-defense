/**
 * 游戏对象模块
 */

import { ActionTypes, EventTypes, GameObjectTypes, ShapeTypes } from '../../config'
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
  // actions = new Map<string /** triggerId */, Set<Action>>()
  actions = new Map<ActionTypes, Action>()

  props = createDefaultGameObjectProps()

  // triggers = new Set<Trigger>()
  skills = new Map<string, Skill>()

  speed = 2

  constructor ({ id, props, ...options }: GameObjectOptions) {
    if (new.target === GameObject) {
      throw new Error('Cannot instantiate GameObject')
    }

    super()
    Object.assign(this, options)

    if (id) {
      this.id = id
    }

    if (props) {
      Object.assign(this.props, props)
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
    // 检测当前对象是否已经空血
    if (this.isDead) {
      context.gameObjects.delete(this.id)
      // 触发击杀事件
      // @todo - 此处应该还需要给对象增加一些被击杀奖励列表
      context.addEvent({
        type: EventTypes.GAME_OBJECT_DEATH,
        triggerObject: this
      })

      return
    }

    // 检测当前对象是否进入了目标区域
    this.isMoveToActionDone(context)

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

  loadAction (action: Action) {
    // const actions = this.actions.get(triggerId) ?? new Set<Action>()

    // actions.add(action)
    this.actions.set(action.type, action)
  }

  unloadActions (action: Action) {
    this.actions.delete(action.type)
  }

  bindTrigger (trigger: Trigger, action?: Action) {
    const { triggerIds } = this

    if (!triggerIds.has(trigger.id) && action) {
      this.loadAction(action)
    }

    this.triggerIds.add(trigger.id)
  }

  unbindTrigger (trigger: Trigger) {
    this.triggerIds.delete(trigger.id)
    // this.unloadActions(trigger.id)
    // this.triggerIds.delete(triggerId)
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

  /**
   * 检测移动动作是否抵达目标位置
   */
  isMoveToActionDone (context: Context) {
    let moveToAction: Action | null = null

    this.actions.forEach(action => {
      if (action.type === ActionTypes.MOVE_TO) {
        moveToAction = action
      }
    })

    if (moveToAction && this.shape.isEntered((moveToAction as Action).target!.shape)) {
      context.addEvent({
        type: EventTypes.GAME_OBJECT_ENTER_AREA,
        triggerObject: this,
        targetObject: (moveToAction as Action).target!
      })
    }
  }

  static isEnemy (gameObject: GameObject) {
    return gameObject.type === GameObjectTypes.ENEMY
  }

  static isSkill (gameObject: GameObject) {
    return gameObject.type === GameObjectTypes.SKILL
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
