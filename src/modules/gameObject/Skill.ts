import { GameObjectTypes } from '../../config'
import { createRandomId } from '../../utils/tools'
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
  constructor ({
    id,
    type
  }: SkillGameObjectOptions) {
    super({
      type: GameObjectTypes.SKILL
    })
    for (const [key, value] of Object.entries(LevelNumeric.Level1)) {
      // @ts-expect-error no-wrong-here
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

  generateBullet () {
    //
  }
}
