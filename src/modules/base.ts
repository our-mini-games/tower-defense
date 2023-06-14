import { type CanvasOptions } from '../types'

export abstract class BaseModule {
  protected abstract data: unknown
  abstract init (): void
  abstract update (): unknown
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

export class BaseCanvasImplement extends BaseCanvas {
  protected data: unknown[] = []
  protected target = document.createElement('canvas')
  protected ctx = this.target.getContext('2d')!

  protected width = 100
  protected height = 100

  constructor (options?: CanvasOptions) {
    super()
    if (options?.width) {
      this.width = options.width
    }

    if (options?.height) {
      this.height = options.height
    }

    this.target.width = this.width
    this.target.height = this.height
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init () {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update () {}

  draw () {
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

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
