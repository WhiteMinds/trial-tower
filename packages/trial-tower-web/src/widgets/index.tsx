import { CSSProperties, FC } from 'react'
import { Entity, Item, Loot, LootType, Skill } from 'hedra-engine'
import MouseOverPopover from '../MouseOverPopover'
import { EntityCard } from './EntityCard'
import { ItemCard } from './ItemCard'
import { SkillCard } from './SkillCard'

const MessageWidget$Entity: FC<{
  entity: Entity.Snapshot
}> = props => {
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
  style?: CSSProperties
}> = props => {
  return (
    <MouseOverPopover
      popupContent={<SkillCard skill={props.skill} />}
      style={{
        margin: '0 8px',
        ...props.style,
      }}
    >
      {props.children ?? `[${props.skill.name}]`}
    </MouseOverPopover>
  )
}

const MessageWidget$Item: FC<{
  item: Item.Snapshot
  style?: CSSProperties
}> = props => {
  return (
    <MouseOverPopover
      popupContent={<ItemCard item={props.item} />}
      style={{
        margin: '0 8px',
        color: '#873688',
        ...props.style,
      }}
    >
      {props.children ?? `[${props.item.name}]`}
    </MouseOverPopover>
  )
}

const MessageWidget$Loot: FC<{
  loot: Loot.Snapshot
}> = props => {
  switch (props.loot.type) {
    case LootType.EXP:
      return <>[经验值 x {props.loot.payload}]</>
    case LootType.Gold:
      return <>[金币 x {props.loot.payload}]</>
    case LootType.Item:
      return <MessageWidget$Item item={props.loot.payload} />
  }
}

export const MessageWidgets = {
  Entity: MessageWidget$Entity,
  Skill: MessageWidget$Skill,
  Item: MessageWidget$Item,
  Loot: MessageWidget$Loot,
}
