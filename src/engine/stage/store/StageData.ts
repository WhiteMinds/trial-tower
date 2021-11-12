import { Entity, Item } from '../types'

export interface StageData {
  entities: Partial<Record<Entity['id'], Entity>>
  items: Partial<Record<Item['id'], Item>>
}

export namespace StageData {
  export const initial: StageData = {
    entities: {},
    items: {},
  }
}

export interface CombatStageData extends StageData {
  currentHP: Partial<Record<Entity['id'], number>>
  progress: Partial<Record<Entity['id'], number>>
}

export namespace CombatStageData {
  export const initial: CombatStageData = {
    ...StageData.initial,
    currentHP: {},
    progress: {},
  }
}
