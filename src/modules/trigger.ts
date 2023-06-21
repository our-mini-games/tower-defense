/**
 * 触发器
 */

import { createRandomId } from '../utils/tools'
import type { Action } from './action'
import { BaseModule } from './base'
import type { GameObject } from './gameObject'

interface TriggerOptions {
  conditions: Array<(...args: unknown[]) => boolean>
  actions: Action[]
  once?: boolean
  id?: string
}

export class Trigger extends BaseModule {
  data = null
  id = createRandomId('Trigger_')

  once = false
  isTriggered = false

  conditions: TriggerOptions['conditions'] = []
  actions: TriggerOptions['actions'] = []

  /** 记录当前时间戳，用于条件计算游戏消耗时间 */
  currentTime = 0

  constructor ({ id, once, conditions, actions }: TriggerOptions) {
    super()
    if (id) {
      this.id = id
    }
    this.once = !!once
    this.conditions = conditions
    this.actions = actions
    this.currentTime = new Date().getTime()
  }

  init () {
    //
  }

  update () {
    //
  }

  check (source: GameObject) {
    // Always return true when conditions.length === 0
    if (this.conditions.length === 0) return false

    return this.conditions.every(condition => condition(source, this))
  }

  fire (source: GameObject) {
    if (this.isTriggered) return

    this.isTriggered = this.once

    if (this.check(source)) {
      source.bindTrigger(this)
    }
  }

  isTimeout (interval: number) {
    const currentTime = new Date().getTime()

    const isTimeout = currentTime - this.currentTime >= interval

    if (isTimeout) {
      this.currentTime = currentTime
    }

    return isTimeout
  }
}
