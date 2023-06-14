import type { Coordinate } from '../types'
import { BaseModule, GameObject } from './base'

export class Towers extends BaseModule {
  data: Tower[] = []
  constructor () {
    super()
    this.init()
  }

  init () {
    //
  }

  update () {
    for (const tower of this.data) {
      tower.update()
    }
  }
}

export class Tower extends GameObject {
  constructor (coordinate: Coordinate = { x: 0, y: 0 }) {
    super()
    this.coordinate = coordinate
  }

  protected coordinate: Coordinate
  destroy (): void {
    // ...
  }

  update (): unknown {
    return this.coordinate
  }

  fire () {
    // ...
  }
}
