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

export enum State {
  ACTIVE,
  INACTIVE
}

export enum EventTypes {
  /** 游戏初始化 */
  GAME_INIT,
  /** 游戏结束 */
  GAME_OVER,
  /** 技能按钮被点击 */
  CLICK_SKILL_BUTTON,
  /** 建造按钮被点击 */
  CLICK_BUILD_BUTTON,
  /** 单位释放技能 */
  GAME_OBJECT_RELEASE_SKILL,

  /** 单位生命值改变 */
  GAME_OBJECT_HEALTH_POINT_CHANGE,
  /** 单位魔法值改变 */
  GAME_OBJECT_MAGIC_POINT_CHANGE,
  /** 单位被攻击 */
  GAME_OBJECT_UNDER_ATTACK,
  /** 单位死亡 */
  GAME_OBJECT_DEATH,
  /** 单位进入区域 */
  GAME_OBJECT_ENTER_AREA,
  /** 单位离开区域 */
  GAME_OBJECT_LEAVE_AREA,

  /** 计时器（单次） */
  SINGLE_TIMER_ARRIVAL,
  /** 计时器（循环） */
  CYCLE_TIMER_ARRIVAL,

  /** 单位被选择 */
  GAME_OBJECT_SELECTED,
  /** 键盘事件 */
  KEYBOARD
}

export enum SkillTypes {
  BUILD,
  PHYSICAL_ATTACK,
  MAGIC_ATTACK
}

export enum SkillModes {
  ACTIVE,
  PASSIVE
}
