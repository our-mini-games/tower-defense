import { type EventTypes, State } from '../../config'
import type { EventObject } from '../../types'
import { createRandomId } from '../../utils/tools'
import type { Action } from '../action'
import type { Context } from '../centralControlSystem'
import { type GameObject } from '../gameObject'

interface TriggerOptions {
  id?: string
  eventType: EventTypes
  conditions?: Array<(eventObject: EventObject, context: Context, thisArg: Trigger) => boolean>
  actions: Array<(eventObject: EventObject, context: Context, thisArg: Trigger) => Action | unknown>
  state?: State
}

export class Trigger {
  id = createRandomId('Trigger')
  #state: State = State.ACTIVE

  eventType!: EventTypes
  conditions: TriggerOptions['conditions'] = []
  actions: TriggerOptions['actions'] = []

  eventObject: EventObject | null = null

  constructor ({ id, eventType, actions, conditions = [], state = State.ACTIVE }: TriggerOptions) {
    if (id) {
      this.id = id
    }

    if (state) {
      this.setState(state)
    }

    Object.assign(this, { eventType, conditions, actions })
  }

  get isActive () {
    return this.#state === State.ACTIVE
  }

  setState (state: State) {
    this.#state = state
  }

  // /**
  //  * 收集事件对象，它包含的触发的对象和目标对象，以及一些必要的坐标信息
  //  */
  // setEventObjects (eventObjects: EventObject[]) {
  //   this.eventObjects = eventObjects
  // }

  checkCondition (eventObject: EventObject, context: Context) {
    return this.conditions?.every(condition => condition(eventObject, context, this))
  }

  fire (eventObject: EventObject, context: Context) {
    if (!this.isActive) return

    if (this.checkCondition(eventObject, context)) {
      this.eventObject = eventObject
      this.doAction(eventObject, context)
    }
  }

  doAction (eventObject: EventObject, context: Context) {
    this.actions.forEach(action => {
      // 如果返回一个是 Action 类型
      const ret = action(eventObject, context, this) as Action

      if (typeof ret?.exec === 'function') {
        const source = ret?.source ?? eventObject?.triggerObject

        if (!source) {
          ret.exec()
        } else {
          (source as GameObject).bindTrigger(this, ret)
        }
      }
      // (action(eventObject, context, this) as Action)?.exec(eventObject?.trigger)
    })
  }
}
