import { Entity, Item } from '../types'

export interface StageData {
  entities: Partial<Record<string, Entity>>
  items: Partial<Record<string, Item>>
}

export namespace StageData {
  export const initial: StageData = {
    entities: {},
    items: {},
  }
}
