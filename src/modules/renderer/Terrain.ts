import { getTerrain, type TerrainSetting } from '../../config'
import type { CanvasOptions, Coordinate } from '../../types'
import { loadImages } from '../../utils/tools'
import { Renderer } from '../base'
import { type Context } from '../centralControlSystem'

interface TerrainData extends Coordinate {
  size: number
  img: HTMLImageElement | HTMLCanvasElement
}

export default class TerrainRenderer extends Renderer {
  private readonly terrainName: string
  data: TerrainData[] = []

  constructor (options: CanvasOptions<{ terrainName: string }>) {
    super(options)

    this.terrainName = options.terrainName
  }

  async init (context: Context) {
    const terrain = await getTerrain(this.terrainName)

    this.data = await this.formatTerrain(terrain)
    this.update(context)
  }

  update (_context: Context) {
    this.clear()
    this.draw()
  }

  draw () {
    const { ctx } = this

    this.data.forEach(item => {
      ctx.drawImage(item.img, item.x, item.y, item.size, item.size)
    })
  }

  async formatTerrain ({ size, layout, resource }: TerrainSetting) {
    const resources = await loadImages(Object.values(resource).map(({ name, src, width, height }) => ({
      name,
      src,
      width,
      height
    })))

    let row: string[]

    const data: TerrainData[] = []

    for (let y = 0; y < layout.length; y++) {
      row = layout[y]

      for (let x = 0; x < row.length; x++) {
        const item = resources.find(i => i.name === row[x])!

        data.push({
          x: x * size,
          y: y * size,
          size,
          img: item.img
        })
      }
    }

    return data
  }
}
