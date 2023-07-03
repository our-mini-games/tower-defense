import './assets/style.css'

import { StatisticsPanelRenderer } from './modules'
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

const statisticsPanelRenderer = new StatisticsPanelRenderer({
  width: 48 * 14,
  height: 48
})

await statisticsPanelRenderer.init()

statisticsPanelRenderer.mount(app, {
  // backgroundColor: 'rgba(0, 192, 168, 0.2)'
  border: '1px solid #abc'
})

statisticsPanelRenderer.draw({
  elapseTime: 4096,
  restHealth: 75,
  goldAmount: 10086
})
