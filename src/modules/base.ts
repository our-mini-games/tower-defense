export abstract class BaseModule {
  protected abstract data: unknown
  abstract init (): void
  abstract update (): unknown
}

export abstract class BaseCanvas {
  protected abstract target: HTMLCanvasElement
  protected abstract ctx: CanvasRenderingContext2D

  protected abstract width: number
  protected abstract height: number

  abstract draw (...args: unknown[]): void
  abstract clear (): void

  abstract mount (...args: unknown[]): void
}
