import './assets/style.css'

import { CentralControlSystem } from './modules/centralControlSystem'

const app = document.querySelector<HTMLElement>('#app')!

const system = new CentralControlSystem(app)

system.init()
  .then(() => {
    system.run()
  })

const oBtn = document.createElement('button')

oBtn.innerHTML = 'PAUSE'
oBtn.addEventListener('click', () => {
  system.pause()
})

oBtn.style.cssText = `
  position: absolute;
  right: 0;
  top: 0;
`

app.appendChild(oBtn)
