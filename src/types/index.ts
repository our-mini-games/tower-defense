export interface Coordinate {
  x: number
  y: number
}

export type CanvasOptions<T extends Record<string, unknown> = Record<string, unknown>> = {
  width?: number
  height?: number
} & T

export interface Resource {
  src: string
  name: string
  width: number
  height: number
}

export interface ImageResource extends Omit<Resource, 'src'> {
  img: HTMLImageElement
}
