/**
 * 交互面板
 * 此面板位置所有面板顶层，并且背景透明度为 0
 * 事件产生的交互都将于此面板上绘制
 */

import type { Coordinate, ImageResource } from '../../types'
import { isPointInGameObject, isSkill } from '../../utils/check'
import { drawCrystalAnimation } from '../../utils/draw'
import { loadImage } from '../../utils/tools'
import { Renderer } from '../base'
import type { GameObject } from '../gameObject'

enum EventState {
  DEFAULT,
  SELECT,
  /**
   * ACTION
   * - 建造 - 指针位置应该有一个建筑物阴影
   * - 释放技能/攻击 - 指针位置应该有有一个技能范围
   */
  ACTION
}

export class InteractivePanelRenderer extends Renderer {
  state: EventState = EventState.DEFAULT
  /** [左（主）键，中键，右键] */
  button = 0

  startPoint: Coordinate = { x: 0, y: 0 }
  #currentPoint: Coordinate = { x: 0, y: 0 }

  crystalResource: ImageResource | null = null

  // 当前选中的游戏对象
  selectedGameObjects: GameObject[] = []

  /** @todo - 这里还没有区分不同类型的 gameObjects */
  gameObjects = new Map<string, GameObject>()

  get currentPoint () {
    return this.#currentPoint
  }

  set currentPoint (point: Coordinate) {
    this.#currentPoint = point
    this.drawSelection()
  }

  get isBuildAction () {
    /**
     * @todo - 检测当前选中对象为一个建造区对象
     */
    return this.selectedGameObjects.length === 1
  }

  get firstSelectedGameObject () {
    return this.selectedGameObjects[0]
  }

  async init (gameObjects: Map<string, GameObject>) {
    this.crystalResource = await loadImage({
      name: 'crystal',
      width: 32,
      height: 32,
      src: '/crystal.png'
    })

    this.gameObjects = gameObjects

    // /** @todo - 测试数据，新增个游戏对象 */
    // const towerGameObject = new TowerGameObject({
    //   id: 't',
    //   shapeOptions: {
    //     midpoint: { x: 0, y: 0 },
    //     width: 48,
    //     height: 8,
    //     models: []
    //   }
    // })

    // drawCrystal(this.crystalResource, this.ctx, { x: this.width / 2, y: this.height / 2 })
  }

  initEvents () {
    const { target } = this

    target.addEventListener('mousedown', this.handleMousedown)
    target.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  drawSelection () {
    this.clear()

    const {
      ctx,
      startPoint: { x: x1, y: y1 },
      currentPoint: { x: x2, y: y2 }
    } = this

    ctx.strokeStyle = '#53E0BB'
    ctx.lineWidth = 2

    ctx.strokeRect(
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.abs(x1 - x2),
      Math.abs(y1 - y2)
    )
  }

  drawSkillShadow ({ x, y }: Coordinate) {
    const {
      ctx,
      firstSelectedGameObject
    } = this

    this.clear()

    if (!firstSelectedGameObject?.shape.model) return

    const {
      img,
      width,
      height
    } = firstSelectedGameObject.shape.model

    ctx.drawImage(img, x, y, width, height)
  }

  handleMousedown = (e: MouseEvent) => {
    e.preventDefault()
    console.log(e)

    this.button = e.button

    if (e.button === 0 && this.state !== EventState.ACTION) {
      this.state = EventState.SELECT
    }

    // mock right-click
    if (e.ctrlKey && e.button === 0) {
      this.button = 2
      this.state = EventState.DEFAULT
    }

    if (this.state === EventState.ACTION) {
      // @todo - 在 Action 动作时，点击右键意味着是取消技能释放
      if (this.button === 2) {
        // ...
      } else if (this.button === 0) {
        // 主键点击，意味着要建造
        // 检测是否满足释放条件
        // - 满足则进行技能释放
        // - 不满足则不处理
      }
    }

    this.startPoint = {
      x: e.clientX,
      y: e.clientY
    }

    document.addEventListener('mousemove', this.handleMousemove)
    document.addEventListener('mouseup', this.handleMouseup)
  }

  handleMousemove = (e: MouseEvent) => {
    e.preventDefault()

    // 进入 ACTION 操作
    // 在 Move 时应该会有一个技能阴影位于指针处
    if (this.state === EventState.ACTION) {
      this.drawSkillShadow({
        x: e.clientX,
        y: e.clientY
      })

      return
    }

    if (e.button === 0 && this.state === EventState.SELECT) {
      this.currentPoint = {
        x: e.clientX,
        y: e.clientY
      }
    }
  }

  handleMouseup = (e: MouseEvent) => {
    e.preventDefault()
    if (this.button === 0 && this.state === EventState.SELECT) {
      const point: Coordinate = {
        x: e.clientX,
        y: e.clientY
      }

      this.currentPoint = point

      this.clear()

      // 检测
      // 1. 用户选中了建造塔的区域
      // 2. 用户选中了已建造的塔
      this.getSelectedGameObjects(point)

      if (this.selectedGameObjects.length === 1 && isSkill(this.firstSelectedGameObject)) {
        // 当前点击了某个技能
      } else {
        document.removeEventListener('mouseup', this.handleMouseup)
      }

      console.log(this.selectedGameObjects)
    } else if (this.button === 2) {
      // 右键点击某个位置
      drawCrystalAnimation(this.crystalResource!, this.ctx, { x: e.clientX, y: e.clientY })

      document.removeEventListener('mousemove', this.handleMousemove)
      document.removeEventListener('mouseup', this.handleMouseup)
    }
  }

  getSelectedGameObjects (point: Coordinate) {
    const {
      gameObjects
    } = this

    gameObjects.forEach(gameObject => {
      if (isPointInGameObject(point, gameObject)) {
        this.selectedGameObjects.push(gameObject)
      }
    })
  }
}
