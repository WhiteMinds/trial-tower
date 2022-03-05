import { Entity } from '../entity'
import { Item } from '../item'
import { Skill } from '../skill'

export type Snapshot = Entity.Snapshot | Skill.Snapshot | Item.Snapshot

export type CombatLog = (string | Snapshot)[]

// export enum CombatLogItemType {
//   Snapshot = 'Snapshot',
// }
