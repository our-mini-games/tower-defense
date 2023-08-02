import { TowerGameObject } from '../../modules/gameObject'
import { type Coordinate } from '../../types'
import { SETTING } from '../setting'
import BuiltInSkills from './skills'

const { chunkSize } = SETTING

const BuiltInTowers = {
  /**
   * 战士
   * - 不可移动
   * - 单体攻击
   * - 普通的攻击速度
   * - 攻击力：高
   */
  warrior: (midpoint: Coordinate) => {
    const tower = new TowerGameObject({
      shapeOptions: {
        midpoint,
        width: chunkSize / 2,
        height: chunkSize / 2,
        fillStyle: 'red'
      },
      props: {
        speed: 0,
        healthPoint: { current: 100, max: 100 },
        magicPoint: { current: 100, max: 100 },
        physicalAttack: 100,
        magicalAttack: 0,
        physicalDefense: 100,
        magicalDefense: 100,
        attackSpeed: 4,
        releaseSpeed: 0
      }
    })

    const skill = BuiltInSkills.normalAttack(4)

    skill.init(tower)

    return tower
  },

  /**
   * 弓箭手
   * - 群体攻击
   * - 超快的攻击速
   * - 攻击力：低
   */
  archer: (midpoint: Coordinate) => {
    const tower = new TowerGameObject({
      shapeOptions: {
        midpoint,
        width: chunkSize / 2,
        height: chunkSize / 2,
        fillStyle: 'orange'
      },
      props: {
        speed: 0,
        healthPoint: { current: 100, max: 100 },
        magicPoint: { current: 100, max: 100 },
        physicalAttack: 50,
        magicalAttack: 0,
        physicalDefense: 100,
        magicalDefense: 100,
        attackSpeed: 10,
        releaseSpeed: 0
      }
    })

    const skill = BuiltInSkills.multipleAttack(2, 8, 100, 1000)

    skill.init(tower)

    return tower
  },

  /**
   * 法师
   * - 群体攻击
   * - 缓慢的攻击速度
   * - 攻击力：非常高
   */
  mega: (midpoint: Coordinate) => {
    const tower = new TowerGameObject({
      shapeOptions: {
        midpoint,
        width: chunkSize / 2,
        height: chunkSize / 2,
        fillStyle: 'blue'
      },
      props: {
        speed: 0,
        healthPoint: { current: 100, max: 100 },
        magicPoint: { current: 1000, max: 1000 },
        physicalAttack: 0,
        magicalAttack: 200,
        physicalDefense: 100,
        magicalDefense: 100,
        attackSpeed: 0,
        releaseSpeed: 2
      }
    })

    const skill = BuiltInSkills.moonDestroy(2, 100, 2000)

    skill.init(tower)

    return tower
  }
}

export default BuiltInTowers
