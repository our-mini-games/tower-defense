import { SkillModes, SkillTypes } from '../../config'
import { createRandomId, sleep } from '../../utils/tools'
import { type Context } from '../centralControlSystem'
import type { GameObject } from '../gameObject'

enum SkillState {
  // 技能准备完成
  ALREADY,
  // 技能起手/释放中
  RELEASING,
  // 技能冷却中
  COOLING
}

interface SpecialConsume {
  descriptions: string
  /**
   * 检测消耗
   * @param gameObject - 技能拥有者
   */
  detectFn: (gameObject: GameObject) => boolean
  /**
   * 执行消耗
   * @param gameObject - 技能拥有者
   */
  consumeFn: (gameObject: GameObject) => void
}
/** MP | HP | 特殊消耗 */
type ConsumeType = [number, number, SpecialConsume?]

export interface SkillOptions {
  id?: string
  name?: string
  descriptions?: string
  shortcutKey?: string

  type?: SkillTypes
  mode?: SkillModes

  range?: number
  attackLimit?: number
  releaseDuration?: number
  cooldown?: number
  consume?: ConsumeType
  attackMultiplier?: number

  /**
   * 技能效果
   * @param target - 攻击目标
   * @param skill - 当前技能
   * @param context
   */
  effects: Array<(targetGameObject: GameObject, context: Context, skill: Skill) => void>

  /**
   * 被动技能执行函数
   */
  execSkill?: (context: Context, skill: Skill) => void
}

// @todo - 技能可使用/学习条件等
export class Skill {
  id = createRandomId('Skill')
  name = createRandomId('Unnamed_skill')
  descriptions = ''
  shortcutKey?: string

  // 技能类型
  type = SkillTypes.PHYSICAL_ATTACK
  // 技能模式
  mode = SkillModes.ACTIVE

  state = SkillState.ALREADY

  // 攻击范围
  range = 1
  // 攻击数量
  attackLimit = 1
  // 释放时间/起手时间
  releaseDuration = 0
  // 技能冷却时间
  cooldown = 0
  // 技能消耗
  consume: ConsumeType = [0, 0, undefined]
  // 攻击倍率
  attackMultiplier = 1

  // 技能所有者
  owner: GameObject | null = null

  effects: SkillOptions['effects'] = []

  // 被动技能触发函数
  execSkill!: SkillOptions['execSkill']

  timer = 0
  startTime = 0

  cooldownProgress = 0

  constructor (options: SkillOptions) {
    Object.assign(this, options)

    if (typeof options.execSkill === 'function') {
      this.execSkill = (context: Context, skill: Skill) => {
        if (this.mode !== SkillModes.PASSIVE) return
        options.execSkill!(context, skill)
      }
    }
  }

  init (owner: GameObject) {
    this.owner = owner
    owner.skills.set(this.id, this)
  }

  setState (state: SkillState) {
    this.state = state
  }

  /**
   * 检测技能是否可释放
   * @param target - 攻击目标
   */
  isReleasable (target: GameObject): boolean {
    const { owner, state, range } = this

    if (!owner) return false

    return state === SkillState.ALREADY &&
      owner.shape.isEntered(target.shape, range) &&
      this.detectConsume()
  }

  /**
   * 检测技能消耗
   */
  detectConsume (): boolean {
    const {
      consume: [magicPoint, healthPoint, specialConsume],
      owner
    } = this

    if (!owner) return false

    const {
      props: {
        magicPoint: { current: currentMagicPoint },
        healthPoint: { current: currentHealthPoint }
      }
    } = owner

    return currentMagicPoint >= magicPoint &&
      currentHealthPoint >= healthPoint &&
      (typeof specialConsume?.detectFn === 'function' ? specialConsume.detectFn(owner) : true)
  }

  /**
   * 进行技能消耗
   */
  doConsume () {
    const {
      consume: [magicPoint, healthPoint, specialConsume],
      owner
    } = this

    if (!owner) {
      return
    }

    owner.doConsume('magicPoint', magicPoint)
    owner.doConsume('healthPoint', healthPoint)
    specialConsume?.consumeFn(owner)
  }

  async release (target: GameObject, context: Context) {
    if (this.isReleasable(target)) {
      // 1. 技能起手等待
      this.setState(SkillState.RELEASING)
      await sleep(this.releaseDuration)

      // 2. 执行技能效果
      this.effects.forEach(effectFn => { effectFn(target, context, this) })

      // 3. 执行完毕后结算消耗
      this.doConsume()

      // 4. 进入冷却状态，启动冷却计时器
      this.setState(SkillState.COOLING)
      this.startTime = new Date().getTime()
      this.runTimer()
    }
  }

  runTimer () {
    this.timer = requestAnimationFrame(this.runTimer.bind(this))
    this.cooldownProgress = (new Date().getTime() - this.startTime) / this.cooldown

    if (this.cooldownProgress >= 1) {
      this.setState(SkillState.ALREADY)
      this.stopTimer()
    }
  }

  stopTimer () {
    cancelAnimationFrame(this.timer)
  }
}
