import { Entity } from '../model/entity'
import { Item } from '../model/item'

export interface Stage {
  getEntity(id: Entity['id']): Entity | null
  createEntity(data: Partial<Entity.Serialized>): Entity
  destroyEntity(id: Entity['id']): void

  getItem(id: Item['id']): Item | null
}
