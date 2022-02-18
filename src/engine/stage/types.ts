import { Entity } from '../model/entity'

export interface Stage {
  getEntity(id: Entity['id']): Entity | null
  createEntity(data: Partial<Entity.Serialized>): Entity
  destroyEntity(id: Entity['id']): void
}
