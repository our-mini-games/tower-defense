import './assets/style.css'

import { ActionTypes, ShapeTypes, SkillModes, SkillReleaseModes, SkillTypes } from './config'
import { MainRenderer } from './modules'
import { Action } from './modules/action'
import { BulletGameObject, type GameObject, PointGameObject, TowerGameObject } from './modules/gameObject'
import { Skill } from './modules/trigger'
import { cloneMidpoint } from './utils/tools'

// import { TechnologyPanelRenderer } from './modules'
// import { type GameObject, SkillGameObject } from './modules/gameObject'
// import { InteractivePanelRenderer } from './modules/renderer/InteractivePanel'
// import { loadImages } from './utils/tools'
// import { StatisticsPanelRenderer } from './modules'
// import { CentralControlSystem } from './modules/centralControlSystem'

const app = document.querySelector<HTMLElement>('#app')!

// const system = new CentralControlSystem(app)

// system.init()
//   .then(() => {
//     system.run()
//   })

// const oBtn = document.createElement('button')

// oBtn.innerHTML = 'PAUSE'
// oBtn.addEventListener('click', () => {
//   system.pause()
// })

// oBtn.style.cssText = `
//   position: absolute;
//   right: 0;
//   top: 0;
// `

// app.appendChild(oBtn)

// const statisticsPanelRenderer = new StatisticsPanelRenderer({
//   width: 48 * 14,
//   height: 48
// })

// await statisticsPanelRenderer.init()

// statisticsPanelRenderer.mount(app, {
//   // backgroundColor: 'rgba(0, 192, 168, 0.2)'
//   border: '1px solid #abc'
// })

// statisticsPanelRenderer.draw({
//   elapseTime: 4096,
//   restHealth: 75,
//   goldAmount: 10086
// })

// const technologyPanelRenderer = new TechnologyPanelRenderer({
//   width: 48 * 4,
//   height: 48 * 2
// })

// await technologyPanelRenderer.init()
// const towerModels = await loadImages([
//   {
//     name: 'tower1',
//     width: 48,
//     height: 48,
//     src: '/tower-warrior.svg'
//   },

//   {
//     name: 'tower2',
//     width: 48,
//     height: 48,
//     src: '/tower-mage.svg'
//   },

//   {
//     name: 'tower3',
//     width: 48,
//     height: 48,
//     src: '/tower-archer.svg'
//   }
// ])

// technologyPanelRenderer.mount(app, {
//   // backgroundColor: 'rgba(0, 192, 168, 0.2)'
//   border: '1px solid #abc'
// })

// const gameObjects = new Map<string, GameObject>()

// for (let i = 0; i < 3; i++) {
//   new SkillGameObject({
//     id: `tower-${i + 1}`,
//     shapeOptions: {
//       midpoint: {
//         x: 12 * (i + 1) + 48 * i + 48 / 2,
//         y: technologyPanelRenderer.height / 2
//       },
//       width: 48,
//       height: 48
//     },
//     models: [towerModels[i]]
//   }).init(gameObjects)
// }

// technologyPanelRenderer.draw(gameObjects)

// // const terrainRenderer = new TerrainRenderer({
// //   terrainName: 'default',
// //   width: 48 * 10,
// //   height: 48 * 7
// // })

// // await terrainRenderer.init()

// // terrainRenderer.mount(app)

// // interactive renderer
// const interactivePanelRenderer = new InteractivePanelRenderer({
//   width: 48 * 10,
//   height: 48 * 7
// })

// interactivePanelRenderer.mount(app, {
//   position: 'absolute',
//   left: '0',
//   top: '0',
//   zIndex: '1'
// })
// interactivePanelRenderer.init(gameObjects)
// interactivePanelRenderer.initEvents()

// 技能测试
const mainRenderer = new MainRenderer({
  width: 400,
  height: 300
})

mainRenderer.mount(app, { border: '1px solid #ddd' })

const gameObjects = new Map<string, GameObject>()
const bullets = new Map<string, BulletGameObject>()

const tower = new TowerGameObject({
  shapeOptions: {
    width: 40,
    height: 40,
    midpoint: { x: 200, y: 150 },
    fillStyle: 'blue'
  }
})

tower.init(gameObjects)

const skill = new Skill({
  type: SkillTypes.ATTACK,
  mode: SkillModes.PASSIVE,
  releaseMode: SkillReleaseModes.DIRECT,
  attackRange: 50,
  releaseTime: 0,
  coolDown: 1000,
  conditions: [
    () => true
  ],
  actions: [
    new Action({
      type: ActionTypes.CREATE,
      target: (gameObject) => {
        // 在 gameObject 当前位置创建一个子弹
        [{ x: 100, y: 50 }, { x: 300, y: 50 }].forEach(point => {
          const bullet = new BulletGameObject({
            shapeOptions: {
              type: ShapeTypes.CIRCLE,
              midpoint: cloneMidpoint(gameObject),
              width: 10,
              height: 10,
              radius: 5,
              fillStyle: 'red'
            },
            target: new PointGameObject({ point }),
            speed: 2,
            range: 100,
            duration: 2000,
            onReached: (bullet, target) => {
              console.log('reached')
              bullet.destroy()
              target?.destroy()
            },
            onIntersection: (_bullet, _gameObject) => {
              // @todo - 对 gameObject 造成伤害
            }
          })

          bullet.init(bullets)
        })
      }
    })
  ]
})

skill.init(tower)

function run () {
  requestAnimationFrame(run)

  mainRenderer.clear()
  gameObjects.forEach(gameObject => {
    gameObject.update()
    mainRenderer.draw(gameObject)
  })

  bullets.forEach(bullet => {
    bullet.update(gameObjects)
    mainRenderer.draw(bullet)
  })
}

run()
