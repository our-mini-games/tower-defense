import type { Resource } from '../types'

export interface TerrainSetting {
  id: number
  name: string
  size: number
  layout: string[][]
  resource: Record<string, Resource>
}

export const getTerrain = (name: string): Promise<TerrainSetting> => {
  return import(`./terrains/${name}.json`)
}
