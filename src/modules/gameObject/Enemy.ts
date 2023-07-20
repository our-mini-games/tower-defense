import { GameObjectTypes } from '../../config'
import type { ImageResource } from '../../types'
import { createRandomId } from '../../utils/tools'
import { RectangleShape, type ShapeOptions } from '../shape'
import { GameObject, type GameObjectProps } from './GameObject'

export interface EnemyGameObjectOptions {
  id?: string
  shapeOptions: Omit<ShapeOptions, 'type'>
  models?: ImageResource[]
  props?: Partial<GameObjectProps>
}

export class EnemyGameObject extends GameObject {
  id: string

  constructor ({
    id,
    shapeOptions,
    models = [],
    props
  }: EnemyGameObjectOptions) {
    super({
      type: GameObjectTypes.ENEMY,
      shape: new RectangleShape(shapeOptions, models),
      props
    })

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    this.id = id || createRandomId('EnemyGameObject')
  }
}
