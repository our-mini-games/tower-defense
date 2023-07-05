import { ActionTypes, GameObjectTypes } from '../../config'
import { createRandomId } from '../../utils/tools'
import { IntervalAction } from '../action'
import { Trigger } from '../trigger'
// import { BulletGameObject } from './Bullet'
import { type EnemyGameObject } from './Enemy'
import { GameObject } from './GameObject'

type Level = Record<string, Partial<SkillGameObject>>

const LevelNumeric: Level = {
  Level1: {
    speed: 1,
    health: 100,
    magicPoints: 10,
    attack: 20,
    attackTime: 10,
    defense: 5,
    magicDefense: 5,
    releaseTime: 2
  },
  Level2: {
    speed: 1,
    health: 100,
    magicPoints: 10,
    attack: 20,
    attackTime: 10,
    defense: 5,
    magicDefense: 5,
    releaseTime: 2
  }
}

export interface SkillGameObjectOptions {
  id?: string
  type: 'Tower' | 'Enemy'
}

export interface SkillGameObject {
  level: string
  health: number
  magicPoints: number
  skills: []
  speed?: number
  attack: number
  attackTime: number
  defense: number
  magicDefense: number
  releaseTime: number
  attackRange: number
  skillDuration: number
  skillCooldown: number
  attackMode: []
}

export class SkillGameObject extends GameObject {
  triggers = new Set<Trigger>()
  constructor ({
    id,
    type
  }: SkillGameObjectOptions) {
    super({
      type: GameObjectTypes.SKILL
    })
    for (const [key, value] of Object.entries(LevelNumeric.Level1)) {
      // @ts-expect-error stable-type-here
      this[key] = value
    }
    type === 'Tower' ? this.initTower() : this.initEnemy()
    this.id = id ?? createRandomId('SkillGameObject')
  }

  initTower () {
    //
  }

  initEnemy () {
    //
  }

  generateBullet (enemy: EnemyGameObject) {
    this.triggers.add(new Trigger({
      conditions: [
        (_gameObject, trigger) => trigger.isTimeout(1000),
        () => !enemy.shape.isEntered(this.shape)
      ],
      actions: [
        new IntervalAction<ActionTypes.CREATE>({
          interval: 1000,
          type: ActionTypes.CREATE,
          callback () {
            // const bullet = new BulletGameObject()

            // console.log(bullet)
          }
        })
      ]
    }))
  }
}
