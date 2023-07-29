import type { ImageResource } from '../../types'
import { loadImages } from '../../utils/tools'
import { Renderer } from '../base'
import { type Context } from '../centralControlSystem'
import type { GameObject } from '../gameObject'

export default class TechnologyPanelRenderer extends Renderer {
  data: ImageResource[] = []

  /**
   * @todo 这里的资源加载后期都应统一全局加载
   */
  async init (context: Context) {
    this.data = await loadImages([
      {
        name: 'border1',
        src: '/border1.png',
        width: 48,
        height: 48
      },
      {
        name: 'border2',
        src: '/border2.png',
        width: 48,
        height: 48
      }
    ])

    this.update(context)
  }

  update (context: Context) {
    this.clear()

    context.gameObjects.forEach(gameObject => {
      this.drawAvatar(gameObject)
    })
  }

  drawAvatar (gameObject: GameObject) {
    const {
      ctx
    } = this

    const {
      shape: {
        midpoint: { x, y },
        width,
        height
      }
    } = gameObject

    /** @todo */
    const border = this.data.find(item => item.name === 'border1')!

    ctx.save()
    ctx.translate(x, y)

    ctx.drawImage(border.img, -border.width / 2, -border.height / 2, border.width, border.height)

    ctx.drawImage(gameObject.shape.model!.img, -width / 4, -height / 4, width / 2, height / 2)

    ctx.restore()
  }
}
