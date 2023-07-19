import { ShapeTypes } from '../config'
import type { GameObject } from '../modules/gameObject'
import type { Coordinate } from '../types'
import { calcHypotenuse, getRectVertexes } from './tools'

export const isSamePoint = ({ x: x1, y: y1 }: Coordinate, { x: x2, y: y2 }: Coordinate) => x1 === x2 && y1 === y2

export const getObjectTypeStr = (val: unknown) => {
  return Object.prototype.toString.call(val)
}

export const isObject = (val: unknown) => getObjectTypeStr(val) === '[object Object]'

export const isArray = (val: unknown) => getObjectTypeStr(val) === '[object Array]'

export const isCircleShape = (gameObject: GameObject) => gameObject.shape.type === ShapeTypes.CIRCLE
export const isRectShape = (gameObject: GameObject) => gameObject.shape.type === ShapeTypes.RECTANGLE

// 坐标系向量
class Vector {
  constructor (public x: number, public y: number) {}

  // 获取向量的长度
  getLength () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  }

  // 向量相加
  add (v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  // 向量相减
  sub (v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  // 向量点积
  dot (v: Vector) {
    return this.x * v.x + this.y * v.y
  }

  // 返回法向量
  perp () {
    return new Vector(this.y, -this.x)
  }

  // 单位向量
  unit () {
    const d = this.getLength()

    return d ? new Vector(this.x / d, this.y / d) : new Vector(0, 0)
  }
}

// 投影
class Projection {
  constructor (public min: number, public max: number) {}

  // 2个投影是否重叠
  overlaps (p: Projection) {
    return this.max > p.min && this.min < p.max
  }
}

// 获取多个点的所有投影轴
function getAxes (points: Coordinate[]) {
  const axes = []

  for (let i = 0, j = points.length - 1; i < j; i++) {
    const v1 = new Vector(points[i].x, points[i].y)
    const v2 = new Vector(points[i + 1].x, points[i + 1].y)

    axes.push(v1.sub(v2).perp().unit())
  }

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const v1 = new Vector(lastPoint.x, lastPoint.y)
  const v2 = new Vector(firstPoint.x, firstPoint.y)

  axes.push(v1.sub(v2).perp().unit())

  return axes
}

// 获取投影轴上的投影，参数为投影轴向量
function getProjection (v: Vector, points: Coordinate[]) {
  let min = Number.MAX_SAFE_INTEGER
  let max = Number.MIN_SAFE_INTEGER

  points.forEach(point => {
    const p = new Vector(point.x, point.y)
    const dotProduct = p.dot(v)

    min = Math.min(min, dotProduct)
    max = Math.max(max, dotProduct)
  })

  return new Projection(min, max)
}

/**
 * 两圆形碰撞
 * 两圆心距离小于两半径之和
 */
const isCircleShapeCollision = (gameObject1: GameObject, gameObject2: GameObject) => {
  const {
    shape: {
      midpoint: m1,
      radius: r1 = 0
    }
  } = gameObject1
  const {
    shape: {
      midpoint: m2,
      radius: r2 = 0
    }
  } = gameObject2

  return calcHypotenuse(m1, m2) < r1 + r2
}

/**
 * 圆与矩形碰撞
 * 1. 定义圆形的圆心坐标 (cx, cy) 和半径 r。
 * 2. 定义矩形的中心坐标 (rectX, rectY)，宽度 rectWidth 和高度 rectHeight。
 * 3. 计算圆心到矩形中心的水平距离 distX 和垂直距离 distY，计算方法为 distX = Math.abs(cx - rectCenterX) 和 distY = Math.abs(cy - rectCenterY)。
 * 4. 判断圆心 cx 和 cy 是否在矩形的范围内：
 *    如果 distX 大于矩形宽度的一半 rectWidth/2 加上圆半径 r，或者 distY 大于矩形高度的一半 rectHeight/2 加上圆半径 r，则圆形和矩形不相交，返回 false。
 *    否则，圆形和矩形相交，返回 true。
 */
const isCircleAndRectCollision = (circle: GameObject, rect: GameObject) => {
  const {
    shape: {
      midpoint: { x: cx, y: cy },
      radius: r = 0
    }
  } = circle

  const {
    shape: {
      midpoint: { x: rectX, y: rectY },
      width,
      height
    }
  } = rect

  const distX = Math.abs(cx - rectX)
  const distY = Math.abs(cy - rectY)

  if (distX > width / 2 + r || distY > height / 2 + r) {
    return false
  }

  return true
}

/**
 * 两个凸多边形是否碰撞
 */
const isConvexPolygonCollision = (points1: Coordinate[], points2: Coordinate[]) => {
  const axes1 = getAxes(points1)
  const axes2 = getAxes(points2)
  const axes = [...axes1, ...axes2]

  for (const ax of axes) {
    const p1 = getProjection(ax, points1)
    const p2 = getProjection(ax, points2)

    if (!p1.overlaps(p2)) {
      return false
    }
  }

  return true
}

// 碰撞检测
export const isCollision = (gameObject1: GameObject, gameObject2: GameObject) => {
  if (isCircleShape(gameObject1) && isCircleShape(gameObject2)) {
    return isCircleShapeCollision(gameObject1, gameObject2)
  }

  if (isCircleShape(gameObject1) && isRectShape(gameObject2)) {
    return isCircleAndRectCollision(gameObject1, gameObject2)
  }

  if (isRectShape(gameObject1) && isCircleShape(gameObject2)) {
    return isCircleAndRectCollision(gameObject2, gameObject1)
  }

  return isConvexPolygonCollision(getRectVertexes(gameObject1.shape), getRectVertexes(gameObject2.shape))
}
