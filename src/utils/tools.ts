import type { GameObject } from '../modules/gameObject'
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
  return new Promise<ImageResource>((resolve, reject) => {
    const oImg = new Image()

    oImg.onload = () => {
      resolve({ name, img: oImg, width, height })
    }
    oImg.onerror = reject
    oImg.src = src
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

export const cloneMidpoint = (gameObject: GameObject) => {
  const {
    shape: {
      midpoint: { x, y }
    }
  } = gameObject

  return { x, y }
}

export const move = (x1: number, y1: number, x2: number, y2: number, distance: number): Coordinate => {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const newX = x1 + distance * Math.cos(angle)
  const newY = y1 + distance * Math.sin(angle)

  return {
    x: Math.round(newX),
    y: Math.round(newY)
  }
}
