import { ShapeTypes } from '../config'
import { type GameObject } from '../modules/gameObject'
import { type Shape } from '../modules/shape'
import type { Coordinate, ImageResource, Resource } from '../types'

interface Rect extends Coordinate {
  width: number
  height: number
}

/**
 * 计算两个矩形的重叠率
 * @param rect1
 * @param rect2
 */
export const calcOverlapArea = ({
  x: x1,
  y: y1,
  width: w1,
  height: h1
}: Rect, {
  x: x2,
  y: y2,
  width: w2,
  height: h2
}: Rect) => {
  // 计算两个矩形的面积
  const area1 = w1 * h1
  const area2 = w2 * h2

  // 判断两个矩形是否相交
  const left = Math.max(x1, x2)
  const top = Math.max(y1, y2)
  const right = Math.min(x1 + w1, x2 + w2)
  const bottom = Math.min(y1 + h1, y2 + h2)

  const overlapWidth = right - left
  const overlapHeight = bottom - top
  const overlapArea = Math.max(0, overlapWidth) * Math.max(0, overlapHeight)

  // 计算重叠率
  return overlapArea / (area1 + area2 - overlapArea)
}

export const createRandomId = (suffix = '') => {
  return `${suffix ? `${suffix}_` : ''}${new Date().getTime()}${Math.random().toString().substring(2, 6)}`
}

export const loadImages = async (resources: Resource[]) => {
  try {
    return await Promise.all(resources.map(resource => loadImage(resource)))
  } catch (err) {
    console.error(err)

    return []
  }
}

export const loadImage = ({ name, width, height, src }: Resource) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathname = (import.meta as any).env.VITE_APP_PATHNAME

  return new Promise<ImageResource>((resolve, reject) => {
    const oImg = new Image()

    oImg.onload = () => {
      resolve({ name, img: oImg, width, height })
    }
    oImg.onerror = reject
    oImg.src = `${pathname.replace(/\/$/, '')}${src}`
  })
}

/**
 * 将秒数转换成时分秒格式
 */
export const convertSeconds = (input = 0): [string, string, string] => {
  const rest = input % (60 * 60)

  return [
    `${Math.floor(input / 60 / 60)}`.padStart(2, '0'),
    `${Math.floor(rest / 60)}`.padStart(2, '0'),
    `${rest % 60}`.padStart(2, '0')
  ]
}

export const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay))

// 计算两点之间的距离 / 直角三角线斜边长度
export const calcHypotenuse = ({ x: x1, y: y1 }: Coordinate, { x: x2, y: y2 }: Coordinate) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export const copyMidpoint = ({ shape: { midpoint: { x, y } } }: GameObject) => ({ x, y })

export const getRectVertexes = ({
  type,
  midpoint: { x, y },
  width,
  height
}: Shape): [Coordinate, Coordinate, Coordinate, Coordinate] => {
  if (type !== ShapeTypes.RECTANGLE) {
    throw new TypeError(`Except a rectangle shape, but got "${type}"`)
  }

  // 矩形顶点
  const leftX = x - width / 2
  const rightX = x + width / 2
  const topY = y - height / 2
  const bottomY = y + height / 2

  return [
    { x: leftX, y: topY },
    { x: rightX, y: topY },
    { x: rightX, y: bottomY },
    { x: leftX, y: bottomY }
  ]
}

/**
 * 找出距离目标对象最近的几个对象
 * @param target - 目标对象
 * @param collections - 集合
 * @param max - 需要从集合中找出几个对象
 */
export const findNearestGameObjects = (target: GameObject, collections: GameObject[], max = 1) => {
  const { shape: { midpoint } } = target

  return collections.sort((a, b) => {
    return calcHypotenuse(a.shape.midpoint, midpoint) - calcHypotenuse(b.shape.midpoint, midpoint)
  }).slice(0, max)
}
