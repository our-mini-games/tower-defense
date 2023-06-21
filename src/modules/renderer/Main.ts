import { Renderer } from '../base'
import type { GameObject } from '../gameObject'

export default class MainRenderer extends Renderer {
  draw (gameObject: GameObject) {
    gameObject.shape.draw(this.ctx)
  }
}
