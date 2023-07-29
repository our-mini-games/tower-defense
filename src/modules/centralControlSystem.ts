/**
 * 游戏主控制系统
 */

import { ActionTypes, EventTypes, GameStates, RendererTypes, ShapeTypes, SkillModes } from '../config'
import { type EventObject, type ImageResource } from '../types'
import { copyMidpoint, findNearestGameObjects, loadImage, sleep } from '../utils/tools'
import { Action } from './action'
import { BaseModule, type Renderer } from './base'
import { AreaGameObject, EnemyGameObject, GameObject, GlobalGameObject, TowerGameObject } from './gameObject'
import { BulletGameObject } from './gameObject/Bullet'
import { Shape } from './shape'
import { Timer } from './Timer'
import { Skill, Trigger } from './trigger'

export interface Context {
  state: GameStates

  gameObjects: Map<string, GameObject>
  bullets: Map<string, BulletGameObject>
  triggers: Set<Trigger>
  eventPool: EventObject[]
  renderers: Map<RendererTypes, Renderer>
  timers: Map<string, any>
  variables: Map<string, any>
  terrains: Map<string, any>

  fps: number
  elapsedTime: number
  remainingLife: number
  goldAmount: number

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

    fps: 1000 / 60,
    elapsedTime: 0,
    // 剩余生命值，当它为 0 时，游戏结束
    remainingLife: 100,
    // 金钱
    goldAmount: 0,

    state: GameStates.PLAYING,

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

    await this.loadTerrains()
    await this.loadTimers()
    await this.loadRenderers()
    await this.loadGameObjects()
    await this.loadTriggers({
      enemyModel
    })

    this.context.addEvent({ type: EventTypes.GAME_INIT })
  }

  update () {
    const { context } = this

    if (context.state !== GameStates.PLAYING) {
      // 游戏结束
      return
    }

    const eventPool = [...context.eventPool]

    // 清空当前帧的事件池
    context.clearEventPool()

    // 更新计时器
    context.timers.forEach(timer => { timer.update(context) })

    context.triggers.forEach(trigger => {
      const eventObject = eventPool.find(event => event.type === trigger.eventType)

      if (eventObject) {
        trigger.fire(eventObject, context)
      }
    })

    context.gameObjects.forEach(gameObject => {
      gameObject.update(context)
    })

    context.bullets.forEach(bullet => {
      bullet.update(context)
    })

    const mainRenderer = context.renderers.get(RendererTypes.MAIN)
    const statisticsPanelRenderer = context.renderers.get(RendererTypes.STATISTICS_PANEL)

    mainRenderer?.clear()
    context.gameObjects.forEach(gameObject => {
      mainRenderer?.draw(gameObject)
    })

    context.bullets.forEach(bullet => {
      mainRenderer?.draw(bullet)
    })

    statisticsPanelRenderer?.update(context)
  }

  async loadTerrains () {
    // const terrainRenderer = new TerrainRenderer({
    //   terrainName: 'default',
    //   width: 48 * 10,
    //   height: 48 * 7
    // })

    // await terrainRenderer.init()
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

    const sendTimer = new Timer({
      id: 'SendTimer',
      duration: 30000,
      immediate: true,
      repeatTimes: Infinity
    })

    sendTimer.init(context)
  }

  async loadRenderers () {
    const {
      MainRenderer,
      ControlPanelRenderer,
      StatisticsPanelRenderer,
      TechnologyPanelRenderer,
      TerrainRenderer,
      InteractivePanelRenderer
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
    const interactivePanelRenderer = new InteractivePanelRenderer({
      width: 48 * 14,
      height: 48 * 8
    })

    renderers.set(RendererTypes.MAIN, mainRenderer)
    renderers.set(RendererTypes.CONTROL_PANEL, controlPanelRenderer)
    renderers.set(RendererTypes.STATISTICS_PANEL, statisticsPanelRenderer)
    renderers.set(RendererTypes.TECHNOLOGY_PANEL, technologyPanelRenderer)
    renderers.set(RendererTypes.TERRAIN, terrainRenderer)
    renderers.set(RendererTypes.INTERACTIVE_PANEL, interactivePanelRenderer)

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
    interactivePanelRenderer.mount(el, {
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: '999'
    })

    const { context } = this

    await statisticsPanelRenderer.init(context)
    await terrainRenderer.init(context)
    await interactivePanelRenderer.init(context)
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
          height: size,
          alpha: 0
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
            height: size,
            alpha: 0
          }
        })
      }),
      new AreaGameObject({
        id: 'destinationArea',
        shapeOptions: {
          midpoint: { x: size * x - size / 2, y: size * y - size / 2 },
          width: size,
          height: size,
          fillStyle: 'red',
          alpha: 0
        }
      }),

      // 创建一个塔来测试
      new TowerGameObject({
        id: 'Tower1',
        shapeOptions: {
          midpoint: { x: size + size / 2, y: size + size / 2 },
          width: size / 2,
          height: size / 2,
          fillStyle: 'orange'
        },
        props: {
          healthPoint: { current: 1000, max: 1000 },
          magicPoint: { current: 1000, max: 1000 },
          physicalAttack: 100
        }
      }),
      new TowerGameObject({
        id: 'Tower2',
        shapeOptions: {
          midpoint: { x: size * 3 + size / 2, y: size * 3 + size / 2 },
          width: size / 2,
          height: size / 2,
          fillStyle: 'brown'
        },
        props: {
          healthPoint: { current: 1000, max: 1000 },
          magicPoint: { current: 1000, max: 1000 },
          physicalAttack: 100
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

    // 初始触发器
    triggers.add(new Trigger({
      eventType: EventTypes.GAME_INIT,
      conditions: [],
      actions: [
        (_1, context) => new Action({
          type: ActionTypes.CREATE,
          target: () => {
            console.log('游戏初始化完成')
            // 给塔装载技能
            const tower1 = context.gameObjects.get('Tower1')!
            const tower2 = context.gameObjects.get('Tower2')!

            const skill1 = new Skill({
              name: '普通攻击',
              mode: SkillModes.PASSIVE,
              range: 100,
              releaseDuration: 200,
              cooldown: 1000,

              effects: [
                (target, skill) => {
                  const bullet = new BulletGameObject({
                    target,
                    owner: skill,
                    shape: new Shape({
                      type: ShapeTypes.CIRCLE,
                      width: 10,
                      height: 10,
                      radius: 5,
                      midpoint: copyMidpoint(skill.owner!),
                      fillStyle: '#000'
                    }),
                    speed: 4,
                    survivalTime: 1000,
                    maxRange: 300,
                    basePhysicalDamage: 5,

                    onReachTarget: (target) => {
                      // target.destroy(context)
                      target.doConsume('healthPoint', bullet.damageCalculation(target), 'decrease')
                    },

                    onCollision: (_collisionTarget, _bullet) => {
                      // collisionTarget.destroy(context)
                    },

                    onOverTime: (_bullet) => {
                      // bullet.destroy(context)
                    },

                    onOverRange: (_bullet) => {
                      // bullet.destroy()
                    },

                    onAttackUpperLimit: (bullet) => {
                      bullet.destroy(context)
                    },

                    onTargetDisappear: (_bullet) => {
                      //
                    }
                  })

                  bullet.init(context)
                }
              ],

              execSkill: (context, skill) => {
                context.gameObjects.forEach(gameObject => {
                  if (GameObject.isEnemy(gameObject)) {
                    skill.release(gameObject)
                  }
                })
              }
            })

            const skill2 = new Skill({
              name: '多重箭',
              mode: SkillModes.PASSIVE,
              range: 100,
              releaseDuration: 200,
              cooldown: 1000,

              effects: [
                (target, skill) => {
                  // 对当前触发目标，以及离它最近的 1 个目标，发一起一攻击（一共2个目标）
                  const collections = [...context.gameObjects.values()]
                    .filter(gameObject => gameObject !== target && GameObject.isEnemy(gameObject))
                  const gameObjects = findNearestGameObjects(target, collections, 1)

                  ;[target, ...gameObjects].forEach(gameObject => {
                    const bullet = new BulletGameObject({
                      target: gameObject,
                      owner: skill,
                      shape: new Shape({
                        type: ShapeTypes.CIRCLE,
                        width: 10,
                        height: 10,
                        radius: 5,
                        midpoint: copyMidpoint(skill.owner!),
                        fillStyle: '#000'
                      }),
                      speed: 4,
                      survivalTime: 1000,
                      maxRange: 300,
                      basePhysicalDamage: 5,

                      onReachTarget: (target) => {
                        target.doConsume('healthPoint', bullet.damageCalculation(target), 'decrease')
                      },

                      onCollision: (_collisionTarget, _bullet) => {
                        //
                      },

                      onOverTime: (_bullet) => {
                        // bullet.destroy(context)
                      },

                      onOverRange: (_bullet) => {
                        // bullet.destroy()
                      },

                      onAttackUpperLimit: (bullet) => {
                        bullet.destroy(context)
                      },

                      onTargetDisappear: (_bullet) => {
                        //
                      }
                    })

                    bullet.init(context)
                  })
                }
              ],

              execSkill: (context, skill) => {
                context.gameObjects.forEach(gameObject => {
                  if (GameObject.isEnemy(gameObject)) {
                    skill.release(gameObject)
                  }
                })
              }
            })

            skill1.init(tower1)
            skill2.init(tower2)
          }
        })
      ]
    }))

    // 游戏结束触发器
    triggers.add(new Trigger({
      id: 'GameOver',
      eventType: EventTypes.GAME_OVER,
      actions: [
        (_, context) => {
          alert('game over')
          context.state = GameStates.FINISHED
        }
      ]
    }))

    // 怪物击杀奖励触发器
    triggers.add(new Trigger({
      id: 'RewardForKilling',
      eventType: EventTypes.GAME_OBJECT_DEATH,
      conditions: [
        e => GameObject.isEnemy(e.triggerObject)
      ],
      actions: [
        (_, context) => {
          // @todo - 这里需要读取奖励列表
          context.goldAmount += 1
        }
      ]
    }))

    // 发兵触发器
    triggers.add(new Trigger({
      id: 'send',
      eventType: EventTypes.TimerHasExpired,
      conditions: [
        (e, context) => e.triggerObject === context.timers.get('SendTimer')
      ],
      actions: [
        async (_, context) => {
          // @todo 发兵数量 / 兵种应该由变量控制
          for (let i = 0; i < 20; i++) {
            const enemy = new EnemyGameObject({
              shapeOptions: {
                midpoint: copyMidpoint(inputArea),
                width: 24,
                height: 25,
                fillStyle: 'blue'
              },
              props: {
                speed: 2,
                healthPoint: { current: 1000, max: 1000 },
                magicPoint: { current: 1000, max: 1000 }
              }
            })

            enemy.init(context)

            context.addEvent({
              type: EventTypes.GAME_OBJECT_ENTER_AREA,
              triggerObject: enemy,
              targetObject: inputArea
            })

            await sleep(1000)
          }
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
          (e, context) => {
            if (index === sourceArray.length - 1) {
              // 敌人抵达终点
              context.remainingLife -= 10

              // 游戏结束
              if (context.remainingLife <= 0) {
                context.addEvent({
                  type: EventTypes.GAME_OVER
                })
              }

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

    this.context.elapsedTime += this.context.fps
  }

  pause () {
    this.context.state = GameStates.PAUSED
    cancelAnimationFrame(this.requestId)
  }
}
