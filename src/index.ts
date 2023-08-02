import './assets/style.css'

import { CentralControlSystem } from './modules/centralControlSystem'

const app = document.querySelector<HTMLElement>('#app')!

const ccs = new CentralControlSystem(app)

ccs.init()
  .then(() => {
    ccs.run()
  })

const oBtn = document.createElement('button')

oBtn.textContent = 'Click'
oBtn.style.cssText = `
  position: fixed;
  right: 0;
  top: 0;
`

oBtn.addEventListener('click', () => {
  ccs.pause()
})

app.appendChild(oBtn)
