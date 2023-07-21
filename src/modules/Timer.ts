import { EventTypes } from '../config'
import { createRandomId } from '../utils/tools'
import { BaseModule } from './base'
import type { Context } from './centralControlSystem'

export interface TimerOptions {
  id?: string
  interval?: number
  repeatTimes?: number
  immediate?: boolean
}

// 计时器
export class Timer extends BaseModule {
  id = createRandomId('Timer')
  interval = 0
  repeatTimes = Infinity
  immediate = false

  data = null

  private createTime = performance.now()

  constructor (options: TimerOptions) {
    super()

    Object.assign(this, options)
  }

  init (context: Context) {
    context.timers.set(this.id, this)

    if (this.immediate) {
      this.createTime = -Infinity
      this.update(context)
    }
  }

  update (context: Context) {
    if (this.isEnded()) {
      context.timers.delete(this.id)

      return
    }

    if (this.isTimeout()) {
      context.addEvent({
        type: EventTypes.CYCLE_TIMER_ARRIVAL,
        triggerObject: this
      })
    }
  }

  isTimeout () {
    const now = performance.now()

    if (now - this.createTime >= this.interval) {
      this.createTime = now

      return true
    }

    return false
  }

  isEnded () {
    return this.repeatTimes <= 0
  }
}
