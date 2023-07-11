/**
 * 触发器
 */

import { createRandomId } from '../../utils/tools'
import type { Action } from '../action'
import { BaseModule } from '../base'
import type { GameObject } from '../gameObject'

export interface TriggerOptions {
  conditions: Array<(source: GameObject, trigger: Trigger) => boolean>
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

  init (..._args: unknown[]) {
    //
  }

  update (..._args: unknown[]) {
    //
  }

  check (source: GameObject) {
    // Always return true when conditions.length === 0
    if (this.conditions.length === 0) return false

    return this.conditions.every(condition => condition(source, this))
  }

  fire (source: GameObject) {
    // 当前 trigger 已经被触发过，此时应该解绑对象中的 actions
    if (this.isTriggered) {
      this.actions.forEach(action => {
        source.actions.forEach(sourceAction => {
          if (action === sourceAction) {
            source.actions.delete(sourceAction.type)
          }
        })
      })
      source.unbindTrigger(this.id)

      return
    }

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
