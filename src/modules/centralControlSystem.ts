/**
 * 游戏主控制系统
 */

import { ActionTypes, GameObjectTypes, RendererTypes, ShapeTypes } from '../config'
import { type ImageResource } from '../types'
import { loadImage } from '../utils/tools'
import { Action, IntervalAction } from './action'
import { BaseModule, type Renderer } from './base'
import { GameObject } from './gameObject'
import { Trigger } from './trigger'

export class CentralControlSystem extends BaseModule {
  data = null

  el: HTMLElement

  gameObjects = new Map<string, GameObject>()
  triggers = new Set<Trigger>()
  renderers = new Map<RendererTypes, Renderer>()

  /** 游戏时间 */
  elapseTime = 0

  requestId = 0

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
    const { gameObjects } = this

    const size = 48
    const x = 10
    const y = 7

    ;[
      GameObject.create(GameObjectTypes.GLOBAL),
      GameObject.create(GameObjectTypes.AREA, {
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
        return GameObject.create(GameObjectTypes.AREA, {
          id: `inflectionPoint${index + 1}`,
          shapeOptions: {
            midpoint,
            width: size,
            height: size
          }
        })
      }),
      GameObject.create(GameObjectTypes.AREA, {
        id: 'destinationArea',
        shapeOptions: {
          midpoint: { x: size * x - size / 2, y: size * y - size / 2 },
          width: size,
          height: size,
          fillStyle: 'red'
        }
      })
    ].forEach(gameObject => {
      gameObject.init(gameObjects)
    })
  }

  // @todo - 临时传递个模型来测试
  async loadTriggers ({ enemyModel }: { enemyModel: ImageResource }) {
    const { triggers, gameObjects } = this

    const inputArea = gameObjects.get('inputArea')!
    const destinationArea = gameObjects.get('destinationArea')!

    triggers.add(new Trigger({
      id: 'Send_Trigger',
      conditions: [
        source => source === inputArea
      ],
      actions: [
        new IntervalAction<ActionTypes.CREATE>({
          interval: 1000,
          type: ActionTypes.CREATE,
          source: inputArea,
          target: {
            type: GameObjectTypes.ENEMY,
            shapeOptions: {
              type: ShapeTypes.CIRCLE,
              midpoint: { ...inputArea.shape.midpoint },
              width: 24,
              height: 24,
              radius: 12,
              fillStyle: 'orange'
            },
            models: [enemyModel]
          },
          callback: (gameObject: GameObject) => {
            gameObject.init(this.gameObjects)
          }
        })
      ]
    }))

    ;([
      inputArea,
      gameObjects.get('inflectionPoint1')!,
      gameObjects.get('inflectionPoint2')!,
      gameObjects.get('inflectionPoint3')!,
      gameObjects.get('inflectionPoint4')!,
      gameObjects.get('inflectionPoint5')!,
      gameObjects.get('inflectionPoint6')!
    ]).forEach((area, index, sourceAreas) => {
      triggers.add(
        new Trigger({
          conditions: [
            source => GameObject.isEnemy(source as GameObject),
            source => (source as GameObject).shape.isEntered(area.shape)
          ],
          actions: [
            new Action({
              type: ActionTypes.MOVE_TO,
              target: sourceAreas.length - 1 === index
                ? destinationArea
                : sourceAreas[index + 1]
            })
          ]
        })
      )
    })

    triggers.add(
      new Trigger({
        conditions: [
          source => (source as GameObject).type === GameObjectTypes.ENEMY,
          source => (source as GameObject).shape.isEntered(destinationArea.shape)
        ],
        actions: [
          new Action({ type: ActionTypes.DESTROY })
        ]
      })
    )
  }

  run () {
    this.requestId = requestAnimationFrame(this.run.bind(this))

    this.update()
  }

  pause () {
    cancelAnimationFrame(this.requestId)
  }
}
