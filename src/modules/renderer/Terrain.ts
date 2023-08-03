import type { Coordinate } from '../../types'
import { Renderer } from '../base'
import { type Context } from '../centralControlSystem'

export interface TerrainData extends Coordinate {
  size: number
  model: string
  midpoint: Coordinate
  movable: boolean
  buildable: boolean
}

export default class TerrainRenderer extends Renderer {
  async init (context: Context) {
    this.update(context)
  }

  update (context: Context) {
    this.clear()
    this.draw(context)
  }

  draw ({ terrains, models }: Context) {
    const { ctx } = this

    terrains.forEach(item => {
      const model = models.get(item.model)!

      ctx.drawImage(
        model.img,
        item.midpoint.x - item.size / 2,
        item.midpoint.y - item.size / 2,
        item.size,
        item.size
      )
    })
  }
}
