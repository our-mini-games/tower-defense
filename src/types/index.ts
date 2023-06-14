export interface Coordinate {
  x: number
  y: number
}

export type CanvasOptions<T extends Record<string, unknown> = Record<string, unknown>> = {
  width?: number
  height?: number
} & T
