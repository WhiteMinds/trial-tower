import produce from 'immer'
import { CombatSystem } from '.'
import { AttrType, Entity } from './model/entity'
import { EquipStore } from './store'

let player: Entity = {
  id: 1,
  name: 'Player',
  strength: {
    type: AttrType.Normal,
    base: 2,
    modifiers: []
  },
  constitution: {
    type: AttrType.Normal,
    base: 2,
    modifiers: []
  },
  speed: {
    type: AttrType.Normal,
    base: 2,
    modifiers: []
  },
  maxHP: {
    type: AttrType.HealthPoint,
    base: 100,
    modifiers: []
  },
  atk: {
    type: AttrType.Attack,
    base: 10,
    modifiers: []
  },
  equips: [0, 1],
}

let monster: Entity = {
  id: 10,
  name: 'Monster',
  strength: {
    type: AttrType.Normal,
    base: 2,
    modifiers: []
  },
  constitution: {
    type: AttrType.Normal,
    base: 2,
    modifiers: []
  },
  speed: {
    type: AttrType.Normal,
    base: 1,
    modifiers: []
  },
  maxHP: {
    type: AttrType.HealthPoint,
    base: 100,
    modifiers: []
  },
  atk: {
    type: AttrType.Attack,
    base: 10,
    modifiers: []
  },
  equips: [],
}

function onEntityInit(entity: Entity) {
  return produce(entity, entity => {
    entity.equips.map(id => EquipStore[id]).forEach(equip => {
      entity.maxHP.modifiers.push(equip.maxHP)
      entity.atk.modifiers.push(equip.atk)
    })
  })
}
player = onEntityInit(player)
console.log(player)

const state = new CombatSystem(
  { members: [player] },
  { members: [monster] }
).start()

console.log(JSON.stringify(state, null, 2))
