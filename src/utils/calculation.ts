/**
 * 一般伤害算法
 *
 * @description (对象的攻击力 - 目标的防御力) * 技能的攻击倍率 * 子弹的基础攻击力
 *
 * @param attack - 对象的攻击力
 * @param defense - 目标的防御力
 * @param attackMultiplier - 技能的攻击倍率
 * @param base - 子弹的基础攻击力
 *
 * @returns 伤害数值
 */
export const damageCalculation = (attack: number, defense: number, attackMultiplier = 1, base = 1) => {
  return Math.max(0, (attack - defense) * attackMultiplier * base)
}
