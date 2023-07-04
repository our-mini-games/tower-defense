/*!
 * 检测类工具函数
 */

import type { Coordinate } from '../types'

export const isSamePoint = ({ x: x1, y: y1 }: Coordinate, { x: x2, y: y2 }: Coordinate) => x1 === x2 && y1 === y2

export const getObjectTypeStr = (val: unknown) => {
  return Object.prototype.toString.call(val)
}

export const isObject = (val: unknown) => getObjectTypeStr(val) === '[object Object]'

export const isArray = (val: unknown) => getObjectTypeStr(val) === '[object Array]'
