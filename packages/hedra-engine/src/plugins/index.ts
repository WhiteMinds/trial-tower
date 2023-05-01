import { Entity } from '../model/entity'

export interface EnginePlugin {
  onKill?: (killer: Entity, target: Entity) => Promise<void>
}
