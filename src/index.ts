import './assets/style.css'

import { CentralControlSystem } from './modules/centralControlSystem'

// import { RendererTypes, ShapeTypes, SkillModes } from './config'
// import { MainRenderer, Skill, type Trigger } from './modules'
// import { type Renderer } from './modules/base'
// import { type Context } from './modules/centralControlSystem'
// import { EnemyGameObject, GameObject, TowerGameObject } from './modules/gameObject'
// import { BulletGameObject } from './modules/gameObject/Bullet'
// import { Shape } from './modules/shape'
// import { copyMidpoint } from './utils/tools'

const app = document.querySelector<HTMLElement>('#app')!

// const tower = new TowerGameObject({
//   shapeOptions: {
//     midpoint: { x: 200, y: 100 },
//     width: 50,
//     height: 50,
//     fillStyle: 'blue'
//   },
//   props: {
//     healthPoint: { current: 1000, max: 1000 },
//     magicPoint: { current: 1000, max: 1000 },
//     physicalAttack: 180
//   }
// })
// const enemy = new EnemyGameObject({
//   shapeOptions: {
//     midpoint: { x: 50, y: 50 },
//     width: 30,
//     height: 30,
//     fillStyle: 'red'
//   },
//   props: {
//     healthPoint: { current: 1000, max: 1000 },
//     magicPoint: { current: 1000, max: 1000 }
//   }
// })

// const enemy2 = new EnemyGameObject({
//   shapeOptions: {
//     midpoint: { x: 150, y: 50 },
//     width: 30,
//     height: 30,
//     fillStyle: 'red'
//   },
//   props: {
//     healthPoint: { current: 1000, max: 1000 },
//     magicPoint: { current: 1000, max: 1000 }
//   }
// })

// const renderer = new MainRenderer({
//   width: 400,
//   height: 400
// })

// const context: Context = {
//   gameObjects: new Map([[tower.id, tower], [enemy.id, enemy]]),
//   bullets: new Map<string, BulletGameObject>(),
//   triggers: new Set<Trigger>(),
//   eventPool: {},
//   renderers: new Map<RendererTypes, Renderer>([[RendererTypes.MAIN, renderer]]),
//   timers: new Map<string, any>(),
//   variables: new Map<string, any>(),
//   terrains: new Map<string, any>()
// }

// const skill = new Skill({
//   name: '普通攻击',
//   mode: SkillModes.PASSIVE,
//   range: 1000,
//   releaseDuration: 200,
//   cooldown: 1000,

//   effects: [
//     (target, skill) => {
//       const bullet = new BulletGameObject({
//         target,
//         owner: skill,
//         shape: new Shape({
//           type: ShapeTypes.CIRCLE,
//           width: 4,
//           height: 4,
//           radius: 2,
//           midpoint: copyMidpoint(skill.owner!),
//           fillStyle: '#000'
//         }),
//         speed: 1,
//         // survivalTime: 300,
//         maxRange: 1000,

//         onReachTarget: (target) => {
//           console.log('reach', target, bullet.damageCalculation())
//           // target.destroy(context)
//           target.doConsume('healthPoint', bullet.damageCalculation(), 'decrease')
//         },

//         onCollision: (collisionTarget, bullet) => {
//           console.log('collision:', collisionTarget, bullet, bullet.damageCalculation())
//           // collisionTarget.destroy(context)
//           collisionTarget.doConsume('healthPoint', bullet.damageCalculation(), 'decrease')
//         },

//         onOverTime: (bullet) => {
//           console.log('overTime')
//           // bullet.destroy(context)
//         },

//         onOverRange: (bullet) => {
//           console.log('overRange')
//           // bullet.destroy()
//         },

//         onAttackUpperLimit: (bullet) => {
//           console.log('upper limit')
//           bullet.destroy(context)
//         },

//         onTargetDisappear: (bullet) => {
//           console.log('target dead!')
//           bullet.destroy(context)
//         }
//       })

//       bullet.init(context)
//     }
//   ],

//   execSkill: (context, skill) => {
//     context.gameObjects.forEach(gameObject => {
//       if (GameObject.isEnemy(gameObject)) {
//         skill.release(gameObject)
//       }
//     })
//   }
// })

// tower.init(context)
// enemy.init(context)
// enemy2.init(context)
// skill.init(tower)

// renderer.init()
// renderer.mount(app, {
//   border: '1px solid #ddd'
// })

// let t = 0

// function run () {
//   t = requestAnimationFrame(run)

//   // console.log(context)

//   // skill.release(enemy)

//   renderer.clear()

//   context.gameObjects.forEach(gameObject => {
//     gameObject.update(context)
//     renderer.draw(gameObject)
//   })
//   context.bullets.forEach(bullet => {
//     bullet.update(context)
//     renderer.draw(bullet)
//   })
// }

// // renderer.draw(tower)
// // renderer.draw(enemy)
// run()

// const oBtn = document.createElement('button')

// oBtn.textContent = 'Click'

// oBtn.addEventListener('click', () => {
//   cancelAnimationFrame(t)
// })

// app.appendChild(oBtn)

// ....
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
