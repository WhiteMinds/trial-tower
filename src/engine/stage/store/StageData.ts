import { Entity, Item } from '../types'

export interface StageData {
  entities: Record<string, Entity>
  items: Record<string, Item>
}

export namespace StageData {
  export const initial: StageData = {
    entities: {},
    items: {},
  }
}
