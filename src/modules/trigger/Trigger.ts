import { type EventTypes, State } from '../../config'
import { createRandomId } from '../../utils/tools'

/** @todo */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventObject = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Context = any

interface TriggerOptions {
  id?: string
  event: EventTypes
  conditions?: Array<(triggerObject: unknown) => boolean>
  actions: Array<(triggerObject: unknown, targetObject: unknown, context: Context, thisArg: Trigger) => void>
}

export class Trigger {
  id = createRandomId('Trigger')
  #state: State = State.ACTIVE

  event!: EventTypes
  conditions: TriggerOptions['conditions'] = []
  actions: TriggerOptions['actions'] = []

  eventObjects: EventObject[] = []

  constructor ({ id, event, conditions, actions }: TriggerOptions) {
    if (id) {
      this.id = id
    }

    Object.assign(this, { event, conditions: conditions ?? [], actions })
  }

  get isActive () {
    return this.#state === State.ACTIVE
  }

  setState (state: State) {
    this.#state = state
  }

  /**
   * 收集事件对象，它包含的触发的对象和目标对象，以及一些必要的坐标信息
   */
  setEventObject (eventObjects: EventObject[]) {
    this.eventObjects = eventObjects
  }

  checkCondition (eventObject: EventObject) {
    return this.conditions?.every(condition => condition(eventObject.trigger))
  }

  fire (context: Context) {
    if (!this.isActive) return

    this.eventObjects.forEach(eventObject => {
      if (this.checkCondition(eventObject)) {
        this.doAction(eventObject, context)
      }
    })
  }

  doAction (eventObject: EventObject, context: Context) {
    this.actions.forEach(action => {
      action(eventObject.trigger, eventObject.target, context, this)
    })
  }
}
