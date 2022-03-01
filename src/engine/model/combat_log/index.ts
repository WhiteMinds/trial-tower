import { UniqueId } from '../../types'
import { Entity } from '../entity'
import { Item } from '../item'
import { Skill } from '../skill'

export type Snapshot = Entity.Snapshot | Skill.Snapshot | Item.Snapshot

export type CombatLog = [
  format: string,
  snapshotMap: Record<string, Snapshot>
  // store: Record<UniqueId, Snapshot>
]
