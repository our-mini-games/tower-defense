/**
 * 游戏主控制系统
 */

import { ActionTypes, EventTypes, RendererTypes, State } from '../config'
import { type EventObject, type ImageResource } from '../types'
import { copyMidpoint, loadImage } from '../utils/tools'
import { Action } from './action'
import { BaseModule, type Renderer } from './base'
import { AreaGameObject, EnemyGameObject, GameObject, GlobalGameObject } from './gameObject'
import type { BulletGameObject } from './gameObject/Bullet'
import { Timer } from './Timer'
import { Trigger } from './trigger'

export interface Context {
  gameObjects: Map<string, GameObject>
  bullets: Map<string, BulletGameObject>
  triggers: Set<Trigger>
  eventPool: EventObject[]
  renderers: Map<RendererTypes, Renderer>
  timers: Map<string, any>
  variables: Map<string, any>
  terrains: Map<string, any>

  addEvent: (event: EventObject) => void
  deleteEvent: (event: EventObject) => void
  clearEventPool: () => void
}

export class CentralControlSystem extends BaseModule {
  data = null

  el: HTMLElement

  gameObjects = new Map<string, GameObject>()
  triggers = new Set<Trigger>()
  renderers = new Map<RendererTypes, Renderer>()

  /** 游戏时间 */
  elapseTime = 0

  requestId = 0

  context: Context = {
    gameObjects: new Map<string, GameObject>(),
    bullets: new Map<string, BulletGameObject>(),
    triggers: new Set<Trigger>(),
    eventPool: [],
    renderers: new Map<RendererTypes, Renderer>(),
    timers: new Map<string, Timer>(),
    variables: new Map<string, any>(),
    terrains: new Map<string, any>(),

    addEvent (event: EventObject) {
      this.eventPool.push(event)
    },
    deleteEvent (event: EventObject) {
      this.eventPool = this.eventPool.filter(e => e === event)
    },
    clearEventPool () {
      this.eventPool.length = 0
    }
  }

  constructor (el: string | HTMLElement) {
    super()

    this.el = typeof el === 'string'
      ? document.querySelector(el)!
      : el
  }

  /** 真实时间 */
  get actualTime () {
    return new Date().getTime()
  }

  /**
   * @todo - 所有内容都应该使用地图配置生成，暂时手写
   */
  async init () {
    const enemyModel = await this.loadResources()

    await this.loadTimers()
    await this.loadRenderers()
    await this.loadGameObjects()
    await this.loadTriggers({
      enemyModel
    })

    this.context.eventPool.push({ type: EventTypes.GAME_INIT })
  }

  update () {
    const { context } = this

    const eventPool = [...context.eventPool]

    // 清空当前帧的事件池
    context.clearEventPool()

    // // 更新计时器
    // context.timers.forEach(timer => { timer.update(context) })

    context.triggers.forEach(trigger => {
      const eventObject = eventPool.find(event => event.type === trigger.eventType)

      if (eventObject) {
        trigger.fire(eventObject, context)
      }
    })

    context.gameObjects.forEach(gameObject => {
      gameObject.update(context)
    })

    const mainRenderer = context.renderers.get(RendererTypes.MAIN)

    mainRenderer?.clear()
    context.gameObjects.forEach(gameObject => {
      mainRenderer?.draw(gameObject)
    })

    // console.log(context.gameObjects.size)
  }

  async loadResources () {
    return await loadImage({
      name: 'enemy',
      width: 32,
      height: 32,
      src: '/enemy.svg'
    })
  }

  async loadTimers () {
    const { context } = this

    // 发兵
    // eslint-disable-next-line no-new
    new Timer({
      id: 'SendTimer',
      duration: 1000,
      immediate: true,
      repeatTimes: Infinity
    }, context)
    // 暂停发兵
    // eslint-disable-next-line no-new
    new Timer({
      id: 'StopSendTimer',
      duration: 5000,
      repeatTimes: Infinity
    }, context)
    // 下一波发兵
    // eslint-disable-next-line no-new
    new Timer({
      id: 'ResendTimer',
      duration: 10000,
      repeatTimes: Infinity
    }, context)

    // this.context.timers.set('GlobalGameTimer', , context))
  }

  async loadRenderers () {
    const {
      MainRenderer,
      ControlPanelRenderer,
      StatisticsPanelRenderer,
      TechnologyPanelRenderer,
      TerrainRenderer
    } = await import('../modules/renderer')

    const { renderers } = this.context

    const statisticsPanelRenderer = new StatisticsPanelRenderer({
      width: 48 * 14,
      height: 48
    })
    const terrainRenderer = new TerrainRenderer({
      terrainName: 'default',
      width: 48 * 10,
      height: 48 * 7
    })
    const mainRenderer = new MainRenderer({
      width: 48 * 10,
      height: 48 * 7
    })
    const technologyPanelRenderer = new TechnologyPanelRenderer({
      width: 48 * 4,
      height: 48 * 3
    })
    const controlPanelRenderer = new ControlPanelRenderer({
      width: 48 * 4,
      height: 48 * 4
    })

    renderers.set(RendererTypes.MAIN, mainRenderer)
    renderers.set(RendererTypes.CONTROL_PANEL, controlPanelRenderer)
    renderers.set(RendererTypes.STATISTICS_PANEL, statisticsPanelRenderer)
    renderers.set(RendererTypes.TECHNOLOGY_PANEL, technologyPanelRenderer)
    renderers.set(RendererTypes.TERRAIN, terrainRenderer)

    const { el } = this

    statisticsPanelRenderer.mount(el, {
      position: 'absolute',
      inset: '0',
      backgroundColor: '#fff'
    })
    terrainRenderer.mount(el, {
      position: 'absolute',
      left: '0',
      top: '48px'
    })
    mainRenderer.mount(el, {
      position: 'absolute',
      left: '0',
      top: '48px',
      zIndex: '1'
    })
    technologyPanelRenderer.mount(el, {
      position: 'absolute',
      left: '480px',
      top: '48px',
      backgroundColor: '#fff'
    })
    controlPanelRenderer.mount(el, {
      position: 'absolute',
      left: '480px',
      top: '192px',
      backgroundColor: '#fff'
    })

    // await terrainRenderer.init()
  }

  async loadGameObjects () {
    const { context } = this

    const size = 48
    const x = 10
    const y = 7

    ;[
      new GlobalGameObject(),
      new AreaGameObject({
        id: 'inputArea',
        shapeOptions: {
          midpoint: { x: size * x - size / 2, y: size / 2 },
          width: size,
          height: size
        }
      }),
      ...[
        { x: size / 2, y: size / 2 },
        { x: size / 2, y: size * 3 - size / 2 },
        { x: size * (x - 1) - size / 2, y: size * 3 - size / 2 },
        { x: size * (x - 1) - size / 2, y: size * 5 - size / 2 },
        { x: size / 2, y: size * 5 - size / 2 },
        { x: size / 2, y: size * 7 - size / 2 }
      ].map((midpoint, index) => {
        return new AreaGameObject({
          id: `inflectionPoint${index + 1}`,
          shapeOptions: {
            midpoint,
            width: size,
            height: size
          }
        })
      }),
      new AreaGameObject({
        id: 'destinationArea',
        shapeOptions: {
          midpoint: { x: size * x - size / 2, y: size * y - size / 2 },
          width: size,
          height: size,
          fillStyle: 'red'
        }
      })
    ].forEach(gameObject => {
      gameObject.init(context)
    })
  }

  // @todo - 临时传递个模型来测试
  async loadTriggers ({ enemyModel }: { enemyModel: ImageResource }) {
    const { context } = this
    const { triggers, gameObjects } = context
    const inputArea = gameObjects.get('inputArea')!

    triggers.add(new Trigger({
      eventType: EventTypes.GAME_INIT,
      conditions: [],
      actions: [
        (_1, context) => new Action({
          type: ActionTypes.CREATE,
          target: () => {
            console.log('游戏初始化完成')
          }
        })
      ]
    }))

    // 发兵触发器
    triggers.add(new Trigger({
      id: 'send',
      eventType: EventTypes.CYCLE_TIMER_ARRIVAL,
      conditions: [
        (e, context) => e.triggerObject === context.timers.get('SendTimer')
      ],
      actions: [
        () => {
          const enemy = new EnemyGameObject({
            shapeOptions: {
              midpoint: copyMidpoint(inputArea),
              width: 24,
              height: 25,
              fillStyle: 'blue'
            },
            props: {
              speed: 4
            }
          })

          gameObjects.set(enemy.id, enemy)
          context.addEvent({
            type: EventTypes.GAME_OBJECT_ENTER_AREA,
            triggerObject: enemy,
            targetObject: inputArea
          })
        }
      ]
    }))

    // 暂停发兵触发器
    triggers.add(new Trigger({
      id: 'stop',
      eventType: EventTypes.CYCLE_TIMER_ARRIVAL,
      conditions: [
        (e, context) => e.triggerObject === context.timers.get('StopSendTimer')
      ],
      actions: [
        (e, context) => {
          // 暂停发兵
          context.timers.get('SendTimer')!.state = State.INACTIVE
          // 停止暂停发兵计时器
          e.triggerObject.state = State.INACTIVE
          // 启动下一波计时器
          context.timers.get('ResendTimer')!.state = State.ACTIVE
        }
      ]
    }))

    // 重新开始发布触发器
    triggers.add(new Trigger({
      id: 'resend',
      eventType: EventTypes.CYCLE_TIMER_ARRIVAL,
      conditions: [
        (e, context) => e.triggerObject === context.timers.get('ResendTimer')
      ],
      actions: [
        (e, context) => {
          // 停止下一波计时器
          e.triggerObject.state = State.INACTIVE
          // 启动发兵
          context.timers.get('SendTimer')!.state = State.ACTIVE
          // 启动暂停发兵计时器
          context.timers.get('StopSendTimer')!.state = State.ACTIVE
        }
      ]
    }))

    ;[
      context.gameObjects.get('inputArea')!,
      context.gameObjects.get('inflectionPoint1')!,
      context.gameObjects.get('inflectionPoint2')!,
      context.gameObjects.get('inflectionPoint3')!,
      context.gameObjects.get('inflectionPoint4')!,
      context.gameObjects.get('inflectionPoint5')!,
      context.gameObjects.get('inflectionPoint6')!,
      context.gameObjects.get('destinationArea')!
    ].forEach((area, index, sourceArray) => {
      triggers.add(new Trigger({
        eventType: EventTypes.GAME_OBJECT_ENTER_AREA,
        conditions: [
          e => GameObject.isEnemy(e.triggerObject),
          e => area === e.targetObject
        ],
        actions: [
          (...args) => {
            console.log(args)
          },
          (e, context) => {
            if (index === sourceArray.length - 1) {
              e.triggerObject.destroy(context)

              return false
            } else {
              return new Action({
                source: e.triggerObject,
                type: ActionTypes.MOVE_TO,
                target: sourceArray[index + 1]
              })
            }
          }
        ]
      }))
    })
  }

  run () {
    this.requestId = requestAnimationFrame(this.run.bind(this))

    this.update()
  }

  pause () {
    cancelAnimationFrame(this.requestId)
  }
}
