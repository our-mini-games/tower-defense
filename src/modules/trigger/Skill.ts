import { SkillModes, SkillReleaseModes, type SkillTypes } from '../../config'
import type { ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
// import { IntervalAction } from '../action'
// import { BulletGameObject } from './Bullet'
import { type EnemyGameObject } from '../gameObject/Enemy'
import type { GameObject } from '../gameObject/GameObject'
import { Trigger, type TriggerOptions } from './'

// @todo - Level
// type Level = Record<string, Partial<SkillGameObject>>

// const LevelNumeric: Level = {
//   Level1: {
//     speed: 1,
//     health: 100,
//     magicPoints: 10,
//     attack: 20,
//     attackTime: 10,
//     defense: 5,
//     magicDefense: 5,
//     releaseTime: 2
//   },
//   Level2: {
//     speed: 1,
//     health: 100,
//     magicPoints: 10,
//     attack: 20,
//     attackTime: 10,
//     defense: 5,
//     magicDefense: 5,
//     releaseTime: 2
//   }
// }

export interface SkillOptions extends TriggerOptions {
  name?: string
  description?: string
  icon?: ImageResource

  /** 技能种类 */
  type: SkillTypes

  /** 技能类型：主动 / 被动 */
  mode?: SkillModes
  /** 技能释放类型：直接释放 / 选中目标释放 */
  releaseMode?: SkillReleaseModes
  /** 技能攻击范围 */
  attackRange?: number
  /** 技能释放/起手时间 */
  releaseTime?: number

  coolDown?: number
}

// export interface SkillGameObject {
//   level: string
//   health: number
//   magicPoints: number
//   skills: []
//   speed?: number
//   attack: number
//   attackTime: number
//   defense: number
//   magicDefense: number
//   releaseTime: number
//   attackRange: number
//   skillDuration: number
//   skillCoolDown: number
//   attackMode: []
// }

/**
 * 技能，应该是一个特殊的触发器
 * - 主动技能：
 *   - 点击直接释放
 *   - 点击后，需要选定位置释放
 * - 被动技能
 */
export class Skill extends Trigger {
  type!: SkillTypes
  mode: SkillModes = SkillModes.ACTIVE
  releaseMode: SkillReleaseModes = SkillReleaseModes.DIRECT

  /** 技能攻击范围 */
  attackRange = 10
  /** 技能释放/起手时间 */
  releaseTime = 0

  /** @todo - default value */
  icon!: ImageResource
  name = 'Default'
  description = 'Default'

  parent: GameObject | null = null

  constructor ({ conditions, actions, id, ...options }: SkillOptions) {
    super({ conditions, actions, once: true, id })
    // for (const [key, value] of Object.entries(LevelNumeric.Level1)) {
    //   // @ts-expect-error stable-type-here
    //   this[key] = value
    // }
    // type === 'Tower' ? this.initTower() : this.initEnemy()

    Object.assign(this, options)

    this.id = id ?? createRandomId('SkillGameObject')
  }

  init (gameObject: GameObject) {
    // 对象装备技能
    gameObject.skills.add(this)
  }

  initTower () {
    //
  }

  initEnemy () {
    //
  }

  generateBullet (enemy: EnemyGameObject) {
    // this.triggers.add(new Trigger({
    //   conditions: [
    //     (_gameObject, trigger) => trigger.isTimeout(1000),
    //     () => !enemy.shape.isEntered(this.shape)
    //   ],
    //   actions: [
    //     new IntervalAction<ActionTypes.CREATE>({
    //       interval: 1000,
    //       type: ActionTypes.CREATE,
    //       callback () {
    //         // const bullet = new BulletGameObject()

    //         // console.log(bullet)
    //       }
    //     })
    //   ]
    // }))
  }
}
