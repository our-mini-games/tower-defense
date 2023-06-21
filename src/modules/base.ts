// import type { GameObjectTypes } from '../config'
import type { CanvasOptions } from '../types'
// import type { Action } from './action'
// import type { Shape } from './shape'

// export abstract class GameObject {
//   abstract type: GameObjectTypes
//   abstract shape: Shape
//   protected abstract triggerIds: Set<string>
//   protected abstract actions: Map<string, Action>
//   protected abstract parentNode: Node

//   abstract update (): unknown
//   abstract destroy (): void
// }

export abstract class BaseModule {
  protected abstract data: unknown
  abstract init (...args: unknown[]): void
  abstract update (...args: unknown[]): unknown
}

export abstract class BaseCanvas extends BaseModule {
  protected abstract target: HTMLCanvasElement
  protected abstract ctx: CanvasRenderingContext2D

  protected abstract width: number
  protected abstract height: number

  abstract draw (...args: unknown[]): void
  abstract clear (): void

  abstract mount (...args: unknown[]): void
}

export class Renderer extends BaseCanvas {
  protected data: unknown[] = []
  #target = document.createElement('canvas')
  #ctx = this.#target.getContext('2d')!

  #width = 100
  #height = 100

  constructor (options?: CanvasOptions) {
    super()
    if (options?.width) {
      this.#width = options.width
    }

    if (options?.height) {
      this.#height = options.height
    }

    this.#target.width = this.#width
    this.#target.height = this.#height
  }

  get target () {
    return this.#target
  }

  get ctx () {
    return this.#ctx
  }

  get width () {
    return this.#width
  }

  get height () {
    return this.#height
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init (..._args: unknown[]) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update (..._args: unknown[]) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  draw (..._args: unknown[]) {}

  clear () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  mount (el: HTMLElement, style?: string | Record<string, string>) {
    const target = this.target

    if (style) {
      if (typeof style === 'string') {
        target.style.cssText = style
      } else {
        Object.entries(style).forEach(([key, value]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          target.style[key as any] = value
        })
      }
    }

    el.appendChild(target)
  }
}
