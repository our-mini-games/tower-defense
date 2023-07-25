import { EventTypes, State } from '../config'
import { createRandomId } from '../utils/tools'
import type { Context } from './centralControlSystem'

export interface TimerOptions {
  id?: string
  repeatTimes?: number
  immediate?: boolean
  duration: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRunner = (callback: (...args: any[]) => any, fps = 1000 / 60) => {
  let lastTimeStamp = 0
  let reqId = -1

  const run = () => {
    const timestamp = performance.now()

    if (timestamp - lastTimeStamp >= fps) {
      callback()

      lastTimeStamp = timestamp
    }

    reqId = requestAnimationFrame(run)
  }

  const stop = () => {
    cancelAnimationFrame(reqId)
  }

  return {
    run,
    stop
  }
}

// // 计时器
// export class Timer extends BaseModule {
//   id = createRandomId('Timer')
//   interval = 0
//   repeatTimes = Infinity
//   immediate = false

//   data = null

//   private createTime = performance.now()

//   constructor (options: TimerOptions) {
//     super()

//     Object.assign(this, options)
//   }

//   init (context: Context) {
//     context.timers.set(this.id, this)

//     if (this.immediate) {
//       this.createTime = -Infinity
//       this.update(context)
//     }
//   }

//   update (context: Context) {
//     if (this.isEnded()) {
//       context.timers.delete(this.id)

//       return
//     }

//     if (this.isTimeout()) {
//       context.addEvent({
//         type: EventTypes.CYCLE_TIMER_ARRIVAL,
//         triggerObject: this
//       })
//     }
//   }

//   isTimeout () {
//     const now = performance.now()

//     if (now - this.createTime >= this.interval) {
//       this.createTime = now

//       return true
//     }

//     return false
//   }

//   isEnded () {
//     return this.repeatTimes <= 0
//   }
// }

export class Timer {
  id!: string
  #state = State.INACTIVE

  initialDuration = Infinity
  initialRepeatTimes = 1

  duration = 0
  repeatTimes = 0

  addEvent!: Context['addEvent']

  runner = createRunner(this.#run.bind(this))

  constructor ({
    id,
    duration,
    repeatTimes,
    immediate = true
  }: TimerOptions, context: Context) {
    this.id = id ?? createRandomId('Timer')

    this.initialDuration = duration
    this.initialRepeatTimes = repeatTimes ?? 1

    if (immediate) {
      this.state = State.ACTIVE

      context.addEvent({
        type: EventTypes.CYCLE_TIMER_ARRIVAL,
        triggerObject: this
      })
    }

    this.addEvent = context.addEvent.bind(context)

    context.timers.set(this.id, this)
  }

  get state () {
    return this.#state
  }

  set state (state: State) {
    this.#state = state

    if (state === State.ACTIVE) {
      this.runner.run()
    } else {
      this.runner.stop()
    }
  }

  check () {
    if (this.duration >= this.initialDuration) {
      this.duration -= this.initialDuration

      if (++this.repeatTimes >= this.initialRepeatTimes) {
        // @todo - 已经结束了计时了
      }
      this.addEvent({
        type: EventTypes.CYCLE_TIMER_ARRIVAL,
        triggerObject: this
      })
      // console.log(1111)
    }
  }

  #run () {
    this.duration += 1000 / 60
    this.check()
  }

  reset (allReset = false) {
    if (allReset) {
      this.repeatTimes = 0
    }

    this.duration = 0
  }
}
