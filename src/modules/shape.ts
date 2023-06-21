import { ShapeTypes } from '../config'
import type { Coordinate, ImageResource } from '../types'
import { isSamePoint } from '../utils/tools'
import { BaseModule } from './base'

export interface ShapeOptions {
  type: ShapeTypes
  midpoint: Coordinate
  width: number
  height: number
  radius?: number
  path?: Coordinate[]
  strokeStyle?: string | CanvasGradient | CanvasPattern
  fillStyle?: string | CanvasGradient | CanvasPattern
  model?: ImageResource
  alpha?: number
}

export class Shape extends BaseModule {
  protected data: ImageResource[] = []

  type!: ShapeTypes
  midpoint!: Coordinate
  // 为了方便计算
  // 所有图形都应该占据一个矩形区域
  width!: number
  height!: number
  radius?: number
  path?: Coordinate[]
  strokeStyle?: string | CanvasGradient | CanvasPattern
  fillStyle?: string | CanvasGradient | CanvasPattern
  model?: ImageResource
  alpha = 1

  constructor (options: ShapeOptions, models: ImageResource[] = []) {
    super()
    Object.assign(this, options)
    this.data = models
  }

  init () {
    this.#switchModel()
  }

  update () {
    this.#switchModel()
  }

  setVelocity (x: number, y: number) {
    this.midpoint = { x, y }
  }

  // setRotate (rotate: number) {
  //   this.rotate = rotate
  // }

  draw (ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    switch (this.type) {
      case ShapeTypes.RECTANGLE:
        this.#drawRectangle(ctx)
        break
      case ShapeTypes.CIRCLE:
        this.#drawCircle(ctx)
        break
      case ShapeTypes.IRREGULAR_FIGURE:
        this.#drawIrregularFigure(ctx)
        break
      default:
        break
    }

    ctx.closePath()
  }

  // 检测当前图形是否与参数图形相交
  isEntered (shape: Shape) {
    const {
      midpoint: { x: x1, y: y1 },
      width: w1,
      height: h1
    } = this
    const {
      midpoint: { x: x2, y: y2 },
      width: w2,
      height: h2
    } = shape

    return (
      x1 >= x2 &&
      y1 >= y2 &&
      (x1 + w1) <= (x2 + w2) &&
      (y1 + h1) <= (y2 + h2)
    ) || (
      x2 >= x1 &&
      y2 >= y1 &&
      (x2 + w2) <= (x1 + w1) &&
      (y2 + h2) <= (y1 + h1)
    )
  }

  #drawRectangle (ctx: CanvasRenderingContext2D) {
    const {
      midpoint: { x: midX, y: midY },
      width,
      height,
      strokeStyle,
      fillStyle,
      alpha
    } = this

    if (!width || !height) return

    const x = width / -2
    const y = height / -2

    ctx.save()

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle
    }

    ctx.globalAlpha = alpha
    ctx.translate(midX, midY)

    if (fillStyle) {
      ctx.fillStyle = fillStyle
      ctx.fillRect(x, y, width, height)
    } else {
      ctx.strokeRect(x, y, width, height)
    }

    ctx.restore()

    this.#drawModel(ctx)
  }

  #drawCircle (ctx: CanvasRenderingContext2D) {
    const {
      midpoint: { x: midX, y: midY },
      radius,
      strokeStyle,
      fillStyle,
      alpha
    } = this

    if (!radius) return

    ctx.save()
    ctx.translate(midX, midY)

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle
    }

    ctx.globalAlpha = alpha

    ctx.arc(0, 0, radius, 0, Math.PI * 2)

    if (fillStyle) {
      ctx.fillStyle = fillStyle
      ctx.fill()
    } else {
      ctx.stroke()
    }

    ctx.restore()

    this.#drawModel(ctx)
  }

  #drawIrregularFigure (ctx: CanvasRenderingContext2D) {
    const {
      path,
      strokeStyle,
      fillStyle,
      alpha
    } = this

    if (!path) return

    if (path.length >= 3) {
      const [start, ...rest] = path

      ctx.save()
      ctx.beginPath()
      ctx.globalAlpha = alpha
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle
      }

      ctx.moveTo(start.x, start.y)

      rest.forEach(({ x, y }) => { ctx.lineTo(x, y) })

      if (!isSamePoint(start, rest.at(-1)!)) {
        ctx.lineTo(start.x, start.y)
      }

      if (fillStyle) {
        ctx.fillStyle = fillStyle
        ctx.fill()
      } else {
        ctx.stroke()
      }

      ctx.closePath()
      ctx.restore()

      this.#drawModel(ctx)
    }
  }

  #drawModel (ctx: CanvasRenderingContext2D) {
    const {
      model,
      midpoint,
      height
    } = this

    if (!model) {
      return
    }

    // 模块应该底部居中对齐
    ctx.save()
    ctx.translate(midpoint.x, midpoint.y)

    ctx.drawImage(
      model.img,
      model.width / -2,
      height / 2 - model.height,
      model.width,
      model.height
    )

    ctx.restore()
  }

  #switchModel () {
    const model = this.data.shift()

    if (model) {
      this.model = model
      this.data.push(model)
    }
  }
}

export class RectangleShape extends Shape {
  constructor (options: Pick<
    ShapeOptions,
    'midpoint' |
    'width' |
    'height' |
    'strokeStyle' |
    'fillStyle' |
    'model' |
    'alpha'
  >, models: ImageResource[] = []) {
    super({
      type: ShapeTypes.RECTANGLE,
      ...options
    }, models)
  }
}

export class CircleShape extends Shape {
  constructor (options: Pick<
    ShapeOptions,
    'midpoint' |
    'width' |
    'height' |
    'radius' |
    'strokeStyle' |
    'fillStyle' |
    'model' |
    'alpha'
  >, models: ImageResource[] = []) {
    super({
      type: ShapeTypes.CIRCLE,
      ...options
    }, models)
  }
}

export class IrregularFigureShape extends Shape {
  constructor (options: Pick<
    ShapeOptions,
    'midpoint' |
    'width' |
    'height' |
    'path' |
    'strokeStyle' |
    'fillStyle' |
    'model' |
    'alpha'
  >, models: ImageResource[] = []) {
    super({
      type: ShapeTypes.IRREGULAR_FIGURE,
      ...options
    }, models)
  }
}
