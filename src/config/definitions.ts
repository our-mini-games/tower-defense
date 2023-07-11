// 命令类型
export enum ActionTypes {
  CREATE,
  DESTROY,
  MOVE_TO
}

// 对象类型
export enum GameObjectTypes {
  DEFAULT,
  // 全局对象
  GLOBAL,
  // 点对象（坐标对象）
  POINT,
  // 区域对象
  AREA,
  // 塔对象
  TOWER,
  // 敌人对象
  ENEMY,
  // 技能对象
  SKILL,
  // 子弹对象
  BULLET
}

// 渲染器类型
export enum RendererTypes {
  // 主游戏渲染
  MAIN = 'Main',
  // 地型绘制
  TERRAIN = 'Terrain',
  // 控制面板
  CONTROL_PANEL = 'controlPanel',
  // 统计面板
  STATISTICS_PANEL = 'StatisticsPanel',
  // 科技面板
  TECHNOLOGY_PANEL = 'TechnologyPanel'
}

export enum ShapeTypes {
  POINT,
  RECTANGLE,
  CIRCLE,
  IRREGULAR_FIGURE
}

/** 技能种类 */
export enum SkillTypes {
  ATTACK,
  MOVE,
  BUILD
}

/** 技能类型 */
export enum SkillModes {
  ACTIVE,
  PASSIVE
}

/** 技能释放类型 */
export enum SkillReleaseModes {
  DIRECT,
  SELECT_TARGET
}
