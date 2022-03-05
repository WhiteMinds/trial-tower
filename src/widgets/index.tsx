import { FC } from 'react'
import { Entity } from '../engine/model/entity'
import { Item } from '../engine/model/item'
import { Skill } from '../engine/model/skill'
import MouseOverPopover from '../MouseOverPopover'
import { EntityCard } from './EntityCard'
import { ItemCard } from './ItemCard'
import { SkillCard } from './SkillCard'

const MessageWidget$Entity: FC<{
  entity: Entity.Snapshot
}> = (props) => {
  return (
    <MouseOverPopover
      popupContent={<EntityCard entity={props.entity} />}
      style={{
        margin: '0 8px',
        // color: isPlayer(props.entity) ? 'blue' : 'red',
      }}
    >
      [{props.entity.name}]
    </MouseOverPopover>
  )
}

const MessageWidget$Skill: FC<{
  skill: Skill.Snapshot
}> = (props) => {
  return (
    <MouseOverPopover
      popupContent={<SkillCard skill={props.skill} />}
      style={{
        margin: '0 8px',
      }}
    >
      [{props.skill.name}]
    </MouseOverPopover>
  )
}

// const MessageWidget$Loots: FC<{
//   loots: Loot[]
// }> = (props) => {
//   return (
//     <>
//       {props.loots.map((loot, idx) => {
//         return (
//           <span key={idx}>
//             [
//             {loot.type === LootType.EXP ? (
//               '经验值'
//             ) : loot.type === LootType.Gold ? (
//               <span style={{ color: '#999900' }}>金币</span>
//             ) : loot.type === LootType.Item ? (
//               <MessageWidget$Item item={loot.item} />
//             ) : null}{' '}
//             x{loot.amount}]
//           </span>
//         )
//       })}
//     </>
//   )
// }

const MessageWidget$Item: FC<{
  item: Item.Snapshot
}> = (props) => {
  return (
    <MouseOverPopover
      popupContent={<ItemCard item={props.item} />}
      style={{
        margin: '0 8px',
        color: '#873688',
      }}
    >
      [{props.item.name}]
    </MouseOverPopover>
  )
}

export const MessageWidgets = {
  Entity: MessageWidget$Entity,
  Skill: MessageWidget$Skill,
  Item: MessageWidget$Item,
  // Loots: MessageWidget$Loots,
}
