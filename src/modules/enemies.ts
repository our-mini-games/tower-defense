import { BaseModule, GameObject } from "./base"
import { Coordinate } from "../types"

export class Enemies extends BaseModule {
  data: Enemy[] = new Array()
  constructor() {
    super()
    this.init()
  }
  init() {

  }
  update() {
    for (let enemy of this.data) {
      enemy.update()
    }
  }
}

export class Enemy extends GameObject {
  constructor(coordinate: Coordinate = { x: 0, y: 0 }) {
    super()
    this.coordinate = coordinate
  }
  protected coordinate: Coordinate
  protected velocity: Coordinate = { x: 0, y: 0 }
  protected rotate: number = 0
  destory(): void {
    // ...
  }
  update(): unknown {
    return this.coordinate
  }
  setVelocity(velocity: Coordinate): void {
    this.velocity = velocity
  }
  setRotate(rotate: number) {
    this.rotate = rotate
  }
}