import { type Coordinate } from '../types'
import { BaseModule, GameObject } from './base'

export class Bullets extends BaseModule {
  data: Bullet[] = []
  constructor () {
    super()
    this.init()
  }

  init () {
    //
  }

  update () {
    for (const bullet of this.data) {
      bullet.update()
    }
  }
}

export class Bullet extends GameObject {
  constructor (coordinate: Coordinate = { x: 0, y: 0 }) {
    super()
    this.coordinate = coordinate
  }

  protected coordinate: Coordinate
  protected velocity?: Coordinate | undefined
  protected rotate = 0
  destroy (): void {
    // ...
  }

  update (): unknown {
    return this.coordinate
  }

  setVelocity (velocity: Coordinate): void {
    this.velocity = velocity
    this.setRotate() // use velocity to calculate self-rotate
  }

  setRotate (rotate?: number) {
    if (rotate) {
      this.rotate = rotate
    } else {
      // ...
    }
  }
}
