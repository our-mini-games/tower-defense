import type { ImageResource } from '../../types'
import { drawHeart } from '../../utils/draw'
import { convertSeconds, loadImages } from '../../utils/tools'
import { Renderer } from '../base'
import { type Context } from '../centralControlSystem'

/**
 * 统计面板
 * 需要绘制内容如下：
 * 1. 当前游戏时间
 * 2. 剩余的生命值（生命值为 0 时游戏结束）
 * 3. 玩家获取金币总额
 * 4. 其它（人口总额 ... 暂时不做）
 */

export interface StatisticsDrawOptions {
  elapseTime: number
  restHealth: number
  goldAmount: number
}
export default class StatisticsPanelRenderer extends Renderer {
  data: ImageResource[] = []

  /**
   * @todo - 这里加载资源用于测试，后续应统一加载界面资源
   */
  async init (context: Context) {
    this.data = await loadImages([
      {
        src: '/gold.svg',
        name: 'gold',
        width: 32,
        height: 32
      },
      {
        src: '/hourglass.svg',
        name: 'hourglass',
        width: 32,
        height: 32
      }
    ])
    const { ctx } = this

    /**
     * @todo 需要配置相关样式
     */
    ctx.fillStyle = '#333'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 20px Microsoft YaHei'

    this.update(context)
  }

  update ({
    elapsedTime,
    remainingLife,
    goldAmount
  }: Context) {
    this.clear()

    this.drawElapseTime(convertSeconds(Math.floor(elapsedTime / 1000)))
    this.drawRemainingLifeBar(remainingLife / 100)
    this.drawGoldAmount(goldAmount)
  }

  drawElapseTime ([hours, minutes, seconds]: [string, string, string]) {
    const {
      ctx,
      height
    } = this

    const halfHeight = height / 2

    ctx.save()
    ctx.beginPath()

    ctx.translate(halfHeight, halfHeight)

    const hourglassResource = this.data.find(item => item.name === 'hourglass')!

    ctx.drawImage(hourglassResource.img, 0, -10, 20, 20)

    ctx.translate(24, 0)

    ctx.fillText(`${hours}:${minutes}:${seconds}`, 0, 0)

    ctx.restore()
    ctx.closePath()
  }

  drawRemainingLifeBar (percentage: number) {
    const {
      ctx,
      width,
      height
    } = this

    const [halfWidth, halfHeight] = [width / 2, height / 2]

    const length = 5 * halfHeight
    const fillStyle = 'pink'
    const gap = 4

    ctx.save()
    ctx.translate(halfWidth - length / 2, halfHeight / 2)

    // 绘制心形背景
    for (let i = 0; i < 5; i++) {
      drawHeart(ctx, (halfHeight + gap) * i, 0, halfHeight, halfHeight, fillStyle, false)
    }

    // 绘制心形填充区
    const img = StatisticsPanelRenderer.drawFillHealthBar(length, halfHeight, percentage, fillStyle, gap)

    ctx.drawImage(img, 0, 0, img.width, img.height)

    ctx.restore()
  }

  static drawFillHealthBar (width: number, height: number, percentage: number, fillStyle: string, gap = 0) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = width + gap * 4
    canvas.height = height

    for (let i = 0; i < 5; i++) {
      drawHeart(ctx, (height + gap) * i, 0, height, height, fillStyle, true)
    }

    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = fillStyle
    ctx.fillRect(0, 0, (width + gap * 4) * percentage, height)

    return canvas
  }

  drawGoldAmount (goldAmount: string | number) {
    const {
      ctx,
      width,
      height
    } = this

    const halfHeight = height / 2

    ctx.save()
    ctx.beginPath()

    ctx.translate(width - halfHeight - 128, halfHeight)

    const goldResource = this.data.find(item => item.name === 'gold')!

    ctx.drawImage(goldResource.img, 0, -10, 20, 20)

    ctx.translate(24, 0)

    ctx.fillText(`${goldAmount}`, 0, 0)

    ctx.restore()
    ctx.closePath()
  }
}
