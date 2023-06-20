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
  ENEMIES
}

// 渲染器类型
export enum RendererTypes {
  // 主游戏渲染
  MAIN = 'MAIN',
  // 地型绘制
  TERRAIN = 'TERRAIN',
  // 控制面板
  CONTROL_PANEL = 'CONTROL_PANEL',
  // 统计面板
  STATISTICS_PANEL = 'STATISTICS_PANEL',
  // 科技面板
  TECHNOLOGY_PANEL = 'TECHNOLOGY_PANEL'
}

export enum ShapeTypes {
  POINT,
  RECTANGLE,
  CIRCLE,
  IRREGULAR_FIGURE
}
