import { Loot } from '../../stage/types'
import { Entity } from '../entity'
import { Item } from '../item'
import { Skill } from '../skill'

export type Snapshot =
  | Entity.Snapshot
  | Skill.Snapshot
  | Item.Snapshot
  | Loot.Snapshot

// TODO: 目前的日志系统还不能支撑非 `(基本类型 | Snapshot)` 的类型，需要再思考下。
export type CombatLog = (string | Snapshot)[]

// 后面如果要扩展 `(基本类型 | Snapshot)` 之外的类型，可能得加上 CombatLogItemType
// export enum CombatLogItemType {
//   Snapshot = 'Snapshot',
// }
