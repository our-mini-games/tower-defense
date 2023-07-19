import { GameObjectTypes } from '../../config'
import type { ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import { RectangleShape, type ShapeOptions } from '../shape'
import { GameObject, type GameObjectProps } from './GameObject'

export interface TowerGameObjectOptions {
  id?: string
  shapeOptions: Omit<ShapeOptions, 'type'>
  models?: ImageResource[]
  props?: Partial<GameObjectProps>
}

export class TowerGameObject extends GameObject {
  id = createRandomId('TowerGameObject')

  constructor ({
    id,
    shapeOptions,
    models = [],
    props
  }: TowerGameObjectOptions) {
    super({
      type: GameObjectTypes.TOWER,
      shape: new RectangleShape(shapeOptions, models),
      props
    })

    if (id) {
      this.id = id
    }
  }
}
