/**
 * 游戏主控制系统
 */

import { ActionTypes, GameObjectTypes, RendererTypes, ShapeTypes } from '../config'
import { type ImageResource } from '../types'
import { createRandomId, loadImage } from '../utils/tools'
import { Action } from './action'
import { BaseModule, type Renderer } from './base'
import { AreaGameObject, type GameObject, GlobalGameObject } from './gameObject'
import { Trigger } from './trigger'

export class CentralControlSystem extends BaseModule {
  data = null

  el: HTMLElement

  gameObjects = new Map<string, GameObject>()
  triggers = new Set<Trigger>()
  renderers = new Map<RendererTypes, Renderer>()

  /** 游戏时间 */
  elapseTime = 0
  /** 真实时间 */
  actualTime = new Date().getTime()

  fps = 60
  requestId = 0

  constructor (el: string | HTMLElement) {
    super()

    this.el = typeof el === 'string'
      ? document.querySelector(el)!
      : el
  }

  /**
   * @todo - 所有内容都应该使用地图配置生成，暂时手写
   */
  async init () {
    const enemyModel = await this.loadResources()

    await this.loadRenderers()
    await this.loadGameObjects()
    await this.loadTriggers({
      enemyModel
    })
  }

  update () {
    this.triggers.forEach(trigger => {
      this.gameObjects.forEach(gameObject => {
        trigger.fire(gameObject)
      })
    })

    this.gameObjects.forEach(gameObject => {
      gameObject.update()
    })

    const mainRenderer = this.renderers.get(RendererTypes.MAIN)!

    mainRenderer.clear()
    this.gameObjects.forEach(gameObject => {
      mainRenderer.draw(gameObject)
    })
  }

  async loadResources () {
    return await loadImage({
      name: 'enemy',
      width: 32,
      height: 32,
      src: '/enemy.svg'
    })
  }

  async loadRenderers () {
    const {
      MainRenderer,
      ControlPanelRenderer,
      StatisticsPanelRenderer,
      TechnologyPanelRenderer,
      TerrainRenderer
    } = await import('../modules/renderer')

    const { renderers } = this

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
    const size = 48
    const x = 10
    const y = 7

    const globalGameObject = new GlobalGameObject()

    const inputArea = new AreaGameObject({
      midpoint: { x: size * x - size / 2, y: size / 2 },
      width: size,
      height: size
    })

    const inflectionPoint1 = new AreaGameObject({
      midpoint: { x: size / 2, y: size / 2 },
      width: size,
      height: size
    })

    const inflectionPoint2 = new AreaGameObject({
      midpoint: { x: size / 2, y: size * 3 - size / 2 },
      width: size,
      height: size
    })

    const inflectionPoint3 = new AreaGameObject({
      midpoint: { x: size * (x - 1) - size / 2, y: size * 3 - size / 2 },
      width: size,
      height: size
    })

    const inflectionPoint4 = new AreaGameObject({
      midpoint: { x: size * (x - 1) - size / 2, y: size * 5 - size / 2 },
      width: size,
      height: size
    })

    const inflectionPoint5 = new AreaGameObject({
      midpoint: { x: size / 2, y: size * 5 - size / 2 },
      width: size,
      height: size
    })

    const inflectionPoint6 = new AreaGameObject({
      midpoint: { x: size / 2, y: size * 7 - size / 2 },
      width: size,
      height: size
    })

    const outputArea = new AreaGameObject({
      midpoint: { x: size * x - size / 2, y: size * y - size / 2 },
      width: size,
      height: size
    })

    const { gameObjects } = this

    gameObjects.set('globalGameObject', globalGameObject)
    gameObjects.set('inputArea', inputArea)
    gameObjects.set('inflectionPoint1', inflectionPoint1)
    gameObjects.set('inflectionPoint2', inflectionPoint2)
    gameObjects.set('inflectionPoint3', inflectionPoint3)
    gameObjects.set('inflectionPoint4', inflectionPoint4)
    gameObjects.set('inflectionPoint5', inflectionPoint5)
    gameObjects.set('inflectionPoint6', inflectionPoint6)
    gameObjects.set('outputArea', outputArea)
  }

  // @todo - 临时传递个模型来测试
  async loadTriggers ({ enemyModel }: { enemyModel: ImageResource }) {
    const { triggers, gameObjects } = this

    const inputArea = gameObjects.get('inputArea')!

    const sendTrigger = new Trigger({
      id: 'Send_Trigger',
      conditions: [
        source => source === inputArea,
        (_, trigger) => (trigger as Trigger).isTimeout(1000)
      ],
      actions: [
        new Action<ActionTypes.CREATE>({
          type: ActionTypes.CREATE,
          source: inputArea,
          target: {
            type: GameObjectTypes.ENEMY,
            shapeOptions: {
              type: ShapeTypes.CIRCLE,
              midpoint: { ...inputArea.shape.midpoint },
              width: 48,
              height: 48,
              radius: 24
            },
            models: [enemyModel]
          },
          callback: (gameObject: GameObject) => {
            this.gameObjects.set(createRandomId('GameObject_'), gameObject)
            gameObject.init(this.gameObjects)

            inputArea.unbindTrigger(sendTrigger.id)
            inputArea.unloadAction(ActionTypes.CREATE)
          }
        })
      ]
    })

    triggers.add(sendTrigger)

    triggers.add(
      new Trigger({
        conditions: [
          source => (source as GameObject)?.type === GameObjectTypes.ENEMY,
          source => (source as GameObject).shape.isEntered(inputArea.shape)
        ],
        actions: [
          new Action({
            type: ActionTypes.MOVE_TO,
            target: gameObjects.get('inflectionPoint1')
          })
        ]
      })
    )

    ;([
      gameObjects.get('inflectionPoint1'),
      gameObjects.get('inflectionPoint2'),
      gameObjects.get('inflectionPoint3'),
      gameObjects.get('inflectionPoint4'),
      gameObjects.get('inflectionPoint5'),
      gameObjects.get('inflectionPoint6')
    ]).forEach((area, index, points) => {
      triggers.add(
        new Trigger({
          conditions: [
            source => (source as GameObject).type === GameObjectTypes.ENEMY,
            source => (source as GameObject).shape.isEntered(area!.shape)
          ],
          actions: [
            new Action({
              type: ActionTypes.MOVE_TO,
              target: points.length - 1 === index
                ? gameObjects.get('outputArea')
                : points[index + 1]
            })
          ]
        })
      )
    })

    triggers.add(
      new Trigger({
        conditions: [
          source => (source as GameObject).type === GameObjectTypes.ENEMY,
          source => (source as GameObject).shape.isEntered(gameObjects.get('outputArea')!.shape)
        ],
        actions: [
          new Action({ type: ActionTypes.DESTROY })
        ]
      })
    )
  }

  run () {
    this.requestId = requestAnimationFrame(this.run.bind(this))

    const currentTime = new Date().getTime()

    if (currentTime - this.actualTime >= this.fps) {
      this.update()
      this.actualTime = currentTime
    }
  }

  pause () {
    cancelAnimationFrame(this.requestId)
  }
}
