import { GameObjectTypes } from '../../config'
import type { ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import { RectangleShape, type ShapeOptions } from '../shape'
import { GameObject } from './GameObject'

export interface TowerGameObjectOptions {
  id?: string
  shapeOptions: Omit<ShapeOptions, 'type'>
  models?: ImageResource[]
}

export class TowerGameObject extends GameObject {
  id = createRandomId('TowerGameObject')

  constructor ({
    id,
    shapeOptions,
    models = []
  }: TowerGameObjectOptions) {
    super({
      type: GameObjectTypes.TOWER,
      shape: new RectangleShape(shapeOptions, models)
    })

    if (id) {
      this.id = id
    }
  }
}
