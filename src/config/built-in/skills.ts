import { Skill } from '../../modules'
import { type Context } from '../../modules/centralControlSystem'
import { AreaGameObject, BulletGameObject, GameObject } from '../../modules/gameObject'
import { Shape } from '../../modules/shape'
import { damageCalculation } from '../../utils/calculation'
import { isCollision } from '../../utils/detect'
import { copyMidpoint, findNearestGameObjects } from '../../utils/tools'
import { ShapeTypes, SkillModes, SkillTypes } from '../definitions'
import { SETTING } from '../setting'

const { chunkSize } = SETTING

const BuiltInSkills = {
  /**
   * 普通攻击
   * @param speed - 攻击速度
   */
  normalAttack: (speed = 100) => {
    const skill = new Skill({
      name: '普通攻击',
      descriptions: '-',
      // shortcutKey: 'A',

      type: SkillTypes.PHYSICAL_ATTACK,
      mode: SkillModes.PASSIVE,

      range: Math.sqrt(chunkSize ** 2 + chunkSize ** 2) + 10,
      attackLimit: 1,
      releaseDuration: speed,
      cooldown: 1000,
      consume: [0, 0, undefined],
      attackMultiplier: 1,

      effects: [
        (gameObject, _context, skill) => {
          // 直接对目标发起攻击，造成伤害
          // @todo - 更新 owner 的模型，替换成攻击状态
          const { owner, attackMultiplier } = skill

          if (!owner) return

          gameObject.doConsume(
            'healthPoint',
            damageCalculation(
              owner.props.physicalAttack,
              gameObject.props.physicalDefense,
              attackMultiplier,
              1
            ),
            'decrease'
          )
        }
      ],

      /**
       * 被动技能执行函数
       */
      execSkill: (context: Context, skill: Skill) => {
        context.gameObjects.forEach(gameObject => {
          if (GameObject.isEnemy(gameObject)) {
            skill.release(gameObject, context)
          }
        })
      }
    })

    return skill
  },

  /**
   * 多重箭（物理，远程）
   * @param max - 最大攻击数量
   * @param speed - 攻击速度
   * @param range - 攻击范围
   * @param cooldown - 冷却时间
   */
  multipleAttack: (max = 1, speed = 100, range = 100, cooldown = 1) => {
    const skill = new Skill({
      name: '多重箭',
      descriptions: `对 ${max} 个发起攻击`,
      // shortcutKey: 'A',

      type: SkillTypes.PHYSICAL_ATTACK,
      mode: SkillModes.PASSIVE,

      range,
      attackLimit: max,
      releaseDuration: speed,
      cooldown,
      consume: [0, 0, undefined],
      attackMultiplier: 1,

      effects: [
        (targetGameObject, context, skill) => {
          // @todo - 更新 owner 的模型，替换成攻击状态
          // 对当前触发目标，以及离它最近的 (max - 1) 个目标，发一起一攻击（一共 max 个目标）
          const collections = [...context.gameObjects.values()]
            .filter(gameObject => gameObject !== targetGameObject && GameObject.isEnemy(gameObject))
          const gameObjects = findNearestGameObjects(targetGameObject, collections, 1)

          ;[targetGameObject, ...gameObjects].forEach(gameObject => {
            const bullet = new BulletGameObject({
              target: gameObject,
              owner: skill,
              shape: new Shape({
                type: ShapeTypes.CIRCLE,
                width: 10,
                height: 10,
                radius: 5,
                midpoint: copyMidpoint(skill.owner!),
                fillStyle: '#000'
              }),
              speed,
              survivalTime: Infinity,
              maxRange: range,
              basePhysicalDamage: 1,

              onReachTarget: (target, bullet) => {
                target.doConsume('healthPoint', bullet.damageCalculation(target), 'decrease')
              },

              onCollision: (_collisionTarget, _bullet) => {
                //
              },

              onOverTime: (bullet) => {
                bullet.destroy(context)
              },

              onOverRange: (bullet) => {
                bullet.destroy(context)
              },

              onAttackUpperLimit: (bullet) => {
                bullet.destroy(context)
              },

              onTargetDisappear: (_bullet) => {
                bullet.destroy(context)
              }
            })

            bullet.init(context)
          })
        }
      ],

      /**
       * 被动技能执行函数
       */
      execSkill: (context: Context, skill: Skill) => {
        context.gameObjects.forEach(gameObject => {
          if (GameObject.isEnemy(gameObject)) {
            skill.release(gameObject, context)
          }
        })
      }
    })

    return skill
  },

  /**
   * 代表月亮消灭你（魔法）（命名者：芋头）
   * @description 对目标所在区域发起一次魔法攻击，包含在子弹形成区域内的所有单位
   *
   * @param speed - 释放速度
   * @param range - 攻击范围
   * @param cooldown - 冷却时间
   */
  moonDestroy: (speed = 100, range = 100, cooldown = 1) => {
    const skill = new Skill({
      name: '代表月亮消灭你（魔法）',
      descriptions: '（命名者：芋头）对目标所在区域发起一次魔法攻击，包含在子弹形成区域内的所有单位',
      // shortcutKey: 'A',

      type: SkillTypes.MAGIC_ATTACK,
      mode: SkillModes.PASSIVE,

      range,
      attackLimit: 1,
      releaseDuration: speed,
      cooldown,
      consume: [0, 0, undefined],
      attackMultiplier: 1,

      effects: [
        (targetGameObject, context, skill) => {
          // @todo - 更新 owner 的模型，替换成攻击状态

          const midpoint = copyMidpoint(targetGameObject)
          const targetArea = new AreaGameObject({
            shapeOptions: {
              midpoint,
              width: 4,
              height: 4
            }
          })
          const bullet = new BulletGameObject({
            target: targetArea,
            owner: skill,
            shape: new Shape({
              type: ShapeTypes.CIRCLE,
              width: 100,
              height: 100,
              radius: 50,
              midpoint,
              fillStyle: '#000'
            }),
            speed,
            survivalTime: Infinity,
            maxRange: range,
            basePhysicalDamage: 1,

            onReachTarget: (_target, bullet) => {
              context.gameObjects.forEach(gameObject => {
                if (GameObject.isEnemy(gameObject) && isCollision(targetArea, gameObject)) {
                  gameObject.doConsume('healthPoint', bullet.damageCalculation(gameObject), 'decrease')
                }
              })
              bullet.destroy(context)
            },

            onCollision: (_collisionTarget, _bullet) => {
              //
            },

            onOverTime: (_bullet) => {
              // bullet.destroy(context)
            },

            onOverRange: (_bullet) => {
              // bullet.destroy()
            },

            onAttackUpperLimit: (bullet) => {
              bullet.destroy(context)
            },

            onTargetDisappear: (_bullet) => {
              //
            }
          })

          bullet.init(context)
        }
      ],

      /**
       * 被动技能执行函数
       */
      execSkill: (context: Context, skill: Skill) => {
        context.gameObjects.forEach(gameObject => {
          if (GameObject.isEnemy(gameObject)) {
            skill.release(gameObject, context)
          }
        })
      }
    })

    return skill
  }

  /**
   * 雷霆半月斩（物理）（设计者：备考24北邮）
   */
}

export default BuiltInSkills
