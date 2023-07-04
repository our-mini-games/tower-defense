import type { ImageResource } from '../types'

export function drawHeart (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style = 'red',
  fill = true
) {
  ctx.save()

  ctx.translate(x, y)

  ctx.moveTo(width / 2, height)
  ctx.bezierCurveTo(-0.49 * width, 0.3 * height, 0.25 * width, -0.425 * height, width / 2, 0.3 * height)
  ctx.bezierCurveTo(0.75 * width, -0.425 * height, width * 1.5, 0.3 * height, 0.49 * width, height)
  if (fill) {
    ctx.fillStyle = style
    ctx.fill()
  } else {
    ctx.strokeStyle = style
    ctx.stroke()
  }
  ctx.restore()
}

/**
 * 获取一个带圆角的图片资源
 * @param resource
 * @param radius
 *
 * ```markdown
 * A number or list specifying the radii of the circular arc to be used for the corners of the rectangle.
 * The number and order of the radii function in the same way as the border-radius CSS property
 * when width and height are positive:
 * - all-corners
 * - [all-corners]
 * - [top-left-and-bottom-right, top-right-and-bottom-left]
 * - [top-left, top-right-and-bottom-left, bottom-right]
 * - [top-left, top-right, bottom-right, bottom-left]
 * ```
 */
export function getRoundedResource (resource: ImageResource, radii: number | number[]): ImageResource {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const { width, height, name, img } = resource

  Object.assign(canvas, { width, height })

  ctx.roundRect(0, 0, width, height, radii)
  ctx.fillStyle = '#000'
  ctx.fill()

  ctx.globalCompositeOperation = 'source-atop'
  ctx.drawImage(img, 0, 0, width, height)

  return {
    name,
    width,
    height,
    img: canvas
  }
}