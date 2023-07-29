import { GameObjectTypes } from '../../config'
import type { Coordinate } from '../../types'
import { isCollision } from '../../utils/detect'
import { calcHypotenuse, copyMidpoint, createRandomId } from '../../utils/tools'
import { type Context } from '../centralControlSystem'
import { type Skill } from '../trigger'
import { GameObject, type GameObjectOptions, PointGameObject } from './GameObject'

export interface BulletGameObjectOptions extends Omit<GameObjectOptions, 'type'> {
  target: GameObject
  owner: Skill

  basePhysicalDamage?: number
  baseMagicDamage?: number
  speed?: number
  attackLimit?: number
  survivalTime?: number
  maxRange?: number

  /** 当子弹与敌对单位交叉/碰撞时，应当如何 */
  onCollision?: (collisionTarget: GameObject, bullet: BulletGameObject) => void
  /** 当子弹抵达目的地时，应当如何 */
  onReachTarget?: (target: GameObject, bullet: BulletGameObject) => void
  /** 当子弹超出范围时，应当如何 */
  onOverRange?: (bullet: BulletGameObject) => void
  /** 当子弹超出存活时间时，应当如何 */
  onOverTime?: (bullet: BulletGameObject) => void
  /** 当子弹超出攻击上限时，应当如何 */
  onAttackUpperLimit?: (bullet: BulletGameObject) => void
  /** 当目标消失/死亡，应当如何？回收 or 继续攻击目标死亡的地方？ */
  onTargetDisappear?: (bullet: BulletGameObject) => void
}

export class BulletGameObject extends GameObject {
  id = createRandomId('Bullet')

  // 子弹的基础伤害
  basePhysicalDamage = 1
  baseMagicDamage = 1

  // 攻击上限
  attackLimit = 1

  // 子弹存活时间
  survivalTime = Infinity
  // 子弹攻击范围
  maxRange = Infinity

  // 攻击行为
  /** 当子弹与敌对单位交叉/碰撞时，应当如何 */
  onCollision: BulletGameObjectOptions['onCollision']
  /** 当子弹抵达目的地时，应当如何 */
  onReachTarget: BulletGameObjectOptions['onReachTarget']
  /** 当子弹超出范围时，应当如何 */
  onOverRange: BulletGameObjectOptions['onOverRange']
  /** 当子弹超出存活时间时，应当如何 */
  onOverTime: BulletGameObjectOptions['onOverTime']
  /** 当子弹超出攻击上限时，应当如何 */
  onAttackUpperLimit: BulletGameObjectOptions['onAttackUpperLimit']
  /** 当目标消失/死亡，应当如何？回收 or 继续攻击目标死亡的地方？ */
  onTargetDisappear: BulletGameObjectOptions['onTargetDisappear']

  startTime = new Date().getTime()
  startCoordination: Coordinate = { x: 0, y: 0 }

  target!: GameObject
  owner!: Skill

  constructor ({
    target,
    owner,

    basePhysicalDamage = 1,
    baseMagicDamage = 1,
    speed = 1,
    attackLimit = 1,
    survivalTime = Infinity,
    maxRange = Infinity,

    onCollision,
    onReachTarget,
    onOverRange,
    onOverTime,
    onAttackUpperLimit,
    onTargetDisappear,
    ...gameObjectOptions
  }: BulletGameObjectOptions) {
    super({
      ...gameObjectOptions,
      props: { ...gameObjectOptions.props, speed },
      type: GameObjectTypes.BULLET
    })

    this.startCoordination = {
      x: gameObjectOptions.shape?.midpoint.x ?? 0,
      y: gameObjectOptions.shape?.midpoint.y ?? 0
    }

    Object.assign(this, {
      target,
      owner,

      basePhysicalDamage,
      baseMagicDamage,
      speed,
      attackLimit,
      survivalTime,
      maxRange,

      onCollision,
      onReachTarget,
      onOverRange,
      onOverTime,
      onAttackUpperLimit,
      onTargetDisappear
    })
  }

  get isOverTime () {
    return (new Date().getTime() - this.startTime) >= this.survivalTime
  }

  get isOverRange () {
    const {
      startCoordination,
      shape: {
        midpoint
      },
      maxRange
    } = this

    return calcHypotenuse(startCoordination, midpoint) > maxRange
  }

  get isReachTarget () {
    const { target } = this

    if (!target) return

    return isCollision(this, target)
  }

  init (context: Context) {
    context.bullets.set(this.id, this)
    this.update(context)
  }

  update (context: Context) {
    this.shape.update()

    if (this.isOverTime) {
      this.onOverTime?.(this)
      this.destroy(context)

      return
    }

    if (this.isOverRange) {
      this.onOverRange?.(this)
      this.destroy(context)

      return
    }

    if (this.isReachTarget) {
      this.onReachTarget?.(this.target, this)
      this.destroy(context)

      return
    }

    context.gameObjects.forEach(gameObject => {
      if (this.attackLimit > 0) {
        if (GameObject.isEnemy(gameObject) && isCollision(this, gameObject)) {
          this.attackLimit--
          this.onCollision?.(gameObject, this)
        }
      } else {
        this.onAttackUpperLimit?.(this)
      }
    })

    if (this.target.isDead) {
      this.onTargetDisappear?.(this)
    }

    // 子弹的默认行为，攻击指定目标
    this.moveTo(this.target)
  }

  // 伤害算法
  damageCalculation (target: GameObject): number {
    // (对象的攻击力 - 目标的防御力) * 基础伤害值 * 技能攻击倍率
    const {
      owner: skill,
      basePhysicalDamage,
      baseMagicDamage
    } = this

    if (!skill || !target) return 0

    const { owner } = skill

    if (!owner) return 0

    const physicalDamage = (
      (owner.props.physicalAttack - target.props.physicalDefense) *
      basePhysicalDamage *
      skill.attackMultiplier
    )

    const magicalDamage = (
      (owner.props.magicalAttack - target.props.magicalDefense) *
      baseMagicDamage *
      skill.attackMultiplier
    )

    return Math.max(0, physicalDamage) + Math.max(magicalDamage)
  }

  // 攻击目标死亡的地方
  attackTargetDeadArea () {
    this.target = new PointGameObject({ point: copyMidpoint(this.target) })
  }

  // 回收子弹
  destroy (context: Context) {
    return context.bullets.delete(this.id)
  }
}
