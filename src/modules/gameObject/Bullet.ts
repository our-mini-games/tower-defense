import { GameObjectTypes } from '../../config'
import type { Coordinate, ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import { Shape, type ShapeOptions } from '../shape'
import { GameObject } from './GameObject'

export interface BulletGameObjectOptions {
  id?: string
  shapeOptions: ShapeOptions
  model?: ImageResource[]
  target: GameObject
  speed?: number
  range?: number
  duration: number
  onIntersection?: typeof destroyBullet
  onReached?: typeof destroyBullet
  // onOutOfRange?: typeof destroyBullet
}

const destroyBullet = (bullet: BulletGameObject, _gameObject?: GameObject) => {
  bullet.destroy()
}

export class BulletGameObject extends GameObject {
  // 当子弹与对象相交时，应该做什么动作
  onIntersection = destroyBullet
  // 当子弹抵达终点时，应该做什么动作
  onReached = destroyBullet
  // 当子弹超出攻击范围时，应该做什么动作
  // onOutOfRange = destroyBullet

  // 子弹攻击的目标
  target!: GameObject
  // 子弹的移动速度
  speed = Infinity
  // 子弹的攻击范围
  range = Infinity
  // 攻击数量上限
  max = Infinity
  // 子弹持续时间
  duration = Infinity

  // 已攻击对象，同一个子弹无法对同一个对象造成多次伤害
  attackedTargets = new Set<GameObject>()

  initialMidpoint: Coordinate = { x: 0, y: 0 }
  createdTime = new Date().getTime()

  constructor ({
    id,
    shapeOptions,
    model,
    ...options
  }: BulletGameObjectOptions) {
    super({
      type: GameObjectTypes.BULLET,
      shape: new Shape(shapeOptions, model)
    })

    Object.assign(this, options)

    this.id = id ?? createRandomId('Bullet')
    this.initialMidpoint = { x: shapeOptions.midpoint.x, y: shapeOptions.midpoint.y }
  }

  get displacementDistance () {
    const {
      initialMidpoint: { x: x1, y: y1 },
      shape: {
        midpoint: { x: x2, y: y2 }
      }
    } = this

    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }

  get attackedSize () {
    return this.attackedTargets.size
  }

  update (gameObjects: Map<string, GameObject>) {
    this.moveTo(this.target)

    // 子弹超出持续时间，直接回收
    if (new Date().getTime() - this.createdTime >= this.duration) {
      this.destroy()

      return
    }

    if (this.isOutOfRange()) {
      this.destroy()

      return
    }

    if (this.isReached()) {
      this.onReached(this)

      return
    }

    gameObjects.forEach(gameObject => {
      if (this.isIntersection(gameObject) && this.attackedSize < this.max) {
        this.onIntersection(this, gameObject)
        this.attackedTargets.add(gameObject)
      }
    })
  }

  isOutOfRange () {
    const {
      displacementDistance,
      range
    } = this

    return range < displacementDistance
  }

  isReached () {
    const {
      displacementDistance,
      range
    } = this

    return Math.abs(range - displacementDistance) <= 2
  }

  isIntersection (gameObject: GameObject): boolean {
    if (gameObject.type !== GameObjectTypes.ENEMY) return false

    return this.shape.isEntered(gameObject.shape)
  }
}
