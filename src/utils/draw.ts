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
