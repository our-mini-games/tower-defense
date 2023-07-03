import { GameObjectTypes } from '../../config'
import { GameObject } from './GameObject'

export interface BulletGameObjectOptions {
  id: number
}

export class BulletGameObject extends GameObject {
  constructor ({
    id
  }: BulletGameObjectOptions) {
    super({
      type: GameObjectTypes.BULLET
    })
  }
}
