/*!
 * 检测类工具函数
 */

import type { GameObject } from '../modules/gameObject'
import type { Coordinate } from '../types'

export const isSamePoint = ({ x: x1, y: y1 }: Coordinate, { x: x2, y: y2 }: Coordinate) => x1 === x2 && y1 === y2

export const getObjectTypeStr = (val: unknown) => {
  return Object.prototype.toString.call(val)
}

export const isObject = (val: unknown) => getObjectTypeStr(val) === '[object Object]'

export const isArray = (val: unknown) => getObjectTypeStr(val) === '[object Array]'

/**
 * Whether the point is in the game object area.
 * All game objects should occupy a rectangular area.
 *
 * @param point
 * @param gameObject
 *
 * @example
 * ```ts
 * const point1 = { x: 0, y: 0 }
 * const point2 = { x: 40, y: 40 }
 * const gameObject = new TowerGameObject({
 *   shapeOptions: {
 *     type: ShapeTypes.CIRCLE,
 *     midpoint: { x: 60, y: 60 },
 *     width: 50,
 *     height: 50,
 *     radius: 25
 *   }
 * })
 *
 * isPointInGameObject(point1, gameObject) // false
 * isPointInGameObject(point2, gameObject) // true
 * ```
 */
export const isPointInGameObject = ({ x, y }: Coordinate, gameObject: GameObject) => {
  const {
    shape: {
      midpoint: { x: minX, y: minY },
      width,
      height
    }
  } = gameObject

  const [
    // 左上角
    x1,
    y1,
    // 右下角
    x2,
    y2
  ] = [
    minX - width / 2,
    minY - height / 2,
    minX + width / 2,
    minY + height / 2
  ]

  return (
    x >= x1 &&
    y >= y1 &&
    x <= x2 &&
    y <= y2
  )
}
