import { type Coordinate } from '../types'
import { BaseModule, GameObject } from './base'

export class Enemies extends BaseModule {
  data: Enemy[] = []
  constructor () {
    super()
    this.init()
  }

  init () {
    //
  }

  update () {
    for (const enemy of this.data) {
      enemy.update()
    }
  }
}

export class Enemy extends GameObject {
  constructor (coordinate: Coordinate = { x: 0, y: 0 }) {
    super()
    this.coordinate = coordinate
  }

  protected coordinate: Coordinate
  protected velocity: Coordinate = { x: 0, y: 0 }
  protected rotate = 0

  destroy (): void {
    // ...
  }

  update (): unknown {
    return this.coordinate
  }

  setVelocity (velocity: Coordinate): void {
    this.velocity = velocity
  }

  setRotate (rotate: number) {
    this.rotate = rotate
  }
}
