import { Entity } from '../model/entity'
import { Item } from '../model/item'

export interface Stage {
  getEntity(id: Entity['id']): Entity | null
  createEntity(data: Partial<Entity.Serialized>): Entity
  destroyEntity(id: Entity['id']): void

  getItem(id: Item['id']): Item | null
  registerItem<T extends Item>(item: T): T
}

// TODO: enum 是不是不应该放在 types.ts 里
export enum LootType {
  EXP = 1,
  Gold,
  Item,
}

export interface Loot$EXP {
  type: LootType.EXP
  amount: number
}

export interface Loot$Gold {
  type: LootType.Gold
  amount: number
}

export interface Loot$Item {
  type: LootType.Item
  item: Item
}

export type Loot = Loot$EXP | Loot$Gold | Loot$Item

export type LootGenerator = (stage: Stage, entity: Entity) => Loot[]
