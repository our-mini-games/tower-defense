import { drawEnergyBar } from '../../utils/draw'
import { Renderer } from '../base'
import { GameObject } from '../gameObject'

export default class MainRenderer extends Renderer {
  draw (gameObject: GameObject) {
    gameObject.shape.draw(this.ctx)

    if (GameObject.isEnemy(gameObject)) {
      this.drawEnergyBar(gameObject)
    }
  }

  drawEnergyBar (gameObject: GameObject) {
    const {
      shape: {
        midpoint: { x, y },
        width,
        height
      },
      props: {
        healthPoint
      }
    } = gameObject

    const barHeight = 4

    const leftX = x - width / 2
    // const magicPointY = y - height / 2 - barHeight - 2 // 2 是与对象模型之间的间隙
    // const healthPointY = magicPointY - barHeight
    const healthPointY = y - height / 2 - barHeight - 2

    drawEnergyBar(
      this.ctx,
      leftX,
      healthPointY,
      width,
      barHeight,
      healthPoint.current / healthPoint.max,
      '#0f0',
      '#000'
    )

    // drawEnergyBar(
    //   this.ctx,
    //   leftX,
    //   magicPointY,
    //   width,
    //   barHeight,
    //   1,
    //   '#00f',
    //   '#000'
    // )
  }
}
