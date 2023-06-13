import { BaseModule, GameObject } from "./base"
import { Coordinate } from "../types"

export class Bullets extends BaseModule {
  data: Bullet[] = new Array()
  constructor() {
    super()
    this.init()
  }
  init() {

  }
  update() {
    for (let bullet of this.data) {
      bullet.update()
    }
  }
}

export class Bullet extends GameObject {
  constructor(coordinate: Coordinate = { x: 0, y: 0 }) {
    super()
    this.coordinate = coordinate
  }
  protected coordinate: Coordinate
  protected velocity?: Coordinate | undefined
  protected rotate: number = 0
  destory(): void {
    // ...
  }
  update(): unknown {
    return this.coordinate
  }
  setVelocity(velocity: Coordinate): void {
    this.velocity = velocity
    this.setRotate() // use velocity to calculate self-rotate
  }
  setRotate(rotate?: number) {
    if (rotate) {
      this.rotate = rotate
    } else {
      // ...
    }
  }
}