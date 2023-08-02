import { EnemyGameObject } from '../../modules/gameObject'
import { type Coordinate } from '../../types'

const builtInEnemies = {
  a: (midpoint: Coordinate) => {
    const enemy = new EnemyGameObject({
      shapeOptions: {
        midpoint,
        width: 24,
        height: 24,
        fillStyle: 'brown'
      },
      props: {
        speed: 2,
        healthPoint: { current: 100, max: 100 },
        magicPoint: { current: 1, max: 1 },
        physicalDefense: 30,
        magicalDefense: 150
      }
    })

    return enemy
  }
}

export default builtInEnemies
