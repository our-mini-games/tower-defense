import type { Coordinate, ImageResource } from '../types'
import { isPointInGameObject } from '../utils/check'
import type { GameObject } from './gameObject'

export interface TerrainOptions {
  data: ImageResource
  midpoint: Coordinate
  width: number
  height: number
  buildable: boolean
  moveable: boolean
}

export class Terrain {
  data!: ImageResource
  midpoint!: Coordinate
  width = 0
  height = 0

  buildable = false
  movable = false

  constructor (options: TerrainOptions) {
    Object.assign(this, options)
  }

  draw (ctx: CanvasRenderingContext2D) {
    const {
      data: { img },
      midpoint: { x, y },
      width,
      height
    } = this

    ctx.save()

    ctx.translate(x, y)

    ctx.drawImage(img, -width / 2, -height / 2, width, height)

    ctx.restore()
  }

  /**
   * 当前点击位置是否在这个地型位置上
   */
  isPointOver (point: Coordinate) {
    const { midpoint, width, height } = this

    return isPointInGameObject(point, {
      shape: {
        midpoint,
        width,
        height
      }
    } as unknown as GameObject)
  }
}
