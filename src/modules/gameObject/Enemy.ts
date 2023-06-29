import { GameObjectTypes } from '../../config'
import type { ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import { RectangleShape, type ShapeOptions } from '../shape'
import { GameObject } from './GameObject'

export interface EnemyGameObjectOptions {.
  id?: string
  shapeOptions: Omit<ShapeOptions, 'type'>
  models?: ImageResource[]
}

export class EnemyGameObject extends GameObject {
  id: string

  constructor ({
    id,
    shapeOptions,
    models = []
  }: EnemyGameObjectOptions) {
    super({
      type: GameObjectTypes.ENEMY,
      shape: new RectangleShape(shapeOptions, models)
    })

    if (id) {
      this.id = id || createRandomId('EnemyGameObject')
    }
  }
}
