import { BaseModule, GameObject } from "./base"
import { Coordinate } from "../types"

export class Towers extends BaseModule {
  data: Tower[] = new Array()
  constructor() {
    super()
    this.init()
  }
  init() {

  }
  update() {
    for (let tower of this.data) {
      tower.update()
    }
  }
}

export class Tower extends GameObject {
  constructor(coordinate: Coordinate = { x: 0, y: 0 }) {
    super()
    this.coordinate = coordinate
  }
  protected coordinate: Coordinate
  destory(): void {
    // ...
  }
  update(): unknown {
    return this.coordinate
  }
  fire() {
    // ...
  }
}