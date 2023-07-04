import './assets/style.css'

import { TechnologyPanelRenderer } from './modules'
import { type GameObject } from './modules/gameObject'
import { TowerGameObject } from './modules/gameObject/Tower'
import { loadImages } from './utils/tools'
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

const technologyPanelRenderer = new TechnologyPanelRenderer({
  width: 48 * 4,
  height: 48 * 2
})

await technologyPanelRenderer.init()
const towerModels = await loadImages([
  {
    name: 'tower1',
    width: 48,
    height: 48,
    src: '/tower-warrior.svg'
  },

  {
    name: 'tower2',
    width: 48,
    height: 48,
    src: '/tower-mage.svg'
  },

  {
    name: 'tower3',
    width: 48,
    height: 48,
    src: '/tower-archer.svg'
  }
])

technologyPanelRenderer.mount(app, {
  // backgroundColor: 'rgba(0, 192, 168, 0.2)'
  border: '1px solid #abc'
})

const gameObjects = new Map<string, GameObject>()

for (let i = 0; i < 3; i++) {
  new TowerGameObject({
    id: `tower-${i + 1}`,
    shapeOptions: {
      midpoint: {
        x: 12 * (i + 1) + 48 * i + 48 / 2,
        y: technologyPanelRenderer.height / 2
      },
      width: 48,
      height: 48
    },
    models: [towerModels[i]]
  }).init(gameObjects)
}

technologyPanelRenderer.draw(gameObjects)
