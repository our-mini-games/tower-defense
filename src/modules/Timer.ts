import { EventTypes, Order, State } from '../config'
import { createRandomId } from '../utils/tools'
import { BaseModule } from './base'
import type { Context } from './centralControlSystem'

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

export interface TimerOptions {
  id?: string
  title?: string
  visible?: boolean
  duration: number
  repeatTimes?: number
  state?: State
  order?: Order
  immediate?: boolean
}
export class Timer extends BaseModule {
  data = null
  id = ''
  title = ''
  visible = false
  duration = 0
  state = State.ACTIVE

  order = Order.DESCEND

  context: Context | null = null

  // 启动 Timer 时，游戏已经运行的时间
  startTime = 0
  // 当前 Timer 计时
  currentTime = 0
  // 重复次数
  repeatTimes = 0
  // 当前重复次数
  currentRepeatTimes = 0

  // 是否立即触发
  immediate = false

  constructor ({
    duration,
    id = createRandomId('Timer'),
    title = '计时器',
    visible = false,
    repeatTimes = 1,
    state = State.ACTIVE,
    order = Order.DESCEND,
    immediate = false
  }: TimerOptions) {
    super()
    Object.assign(this, {
      id,
      title,
      visible,
      duration,
      repeatTimes,
      state,
      order,
      immediate
    })
  }

  get isActive () {
    return this.state === State.ACTIVE
  }

  // 已经运行的时长
  get elapsedTime () {
    return this.currentTime - this.startTime
  }

  // 计时器是否已经到时
  get isTimerHasExpired () {
    return this.duration - this.elapsedTime <= 0
  }

  // 计时器是否已经重复完毕
  get isDone () {
    return this.repeatTimes - this.currentRepeatTimes <= 0
  }

  // 展示的时间
  get displayTime () {
    return this.order === Order.ASCEND
      ? this.elapsedTime
      : this.duration - this.elapsedTime
  }

  init (context: Context) {
    this.context = context
    context.timers.set(this.id, this)
    this.update(context)

    // 立即触发一次
    if (this.immediate) {
      this.onTimerHasExpired(context)
    }
  }

  update (context: Context) {
    if (this.isActive) {
      this.currentTime = context.elapsedTime

      if (this.isTimerHasExpired) {
        this.onTimerHasExpired(context)
      }
    }
  }

  setState (state: State) {
    if (!this.context) {
      throw new Error('`init()` must invoked before `setState()`.')
    }

    this.state = state
    if (state === State.ACTIVE) {
      this.startTime = this.context.elapsedTime
    }
  }

  display () {
    this.visible = true
  }

  hide () {
    this.visible = false
  }

  onTimerHasExpired (context: Context) {
    // 触发计时器到期事件
    context.addEvent({
      type: EventTypes.TimerHasExpired,
      triggerObject: this
    })

    // 重复次数 + 1
    this.currentRepeatTimes++

    if (this.isDone) {
      // 计时器已经完成所有次数的计时，将其失活
      this.setState(State.INACTIVE)
    } else {
      // 重置计时器初始时间
      this.startTime = this.currentTime
    }
  }
}
