import { Engine } from '.'
import { AttrType } from './model/entity'

const engine = new Engine()

const player = engine.createEntity({
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
})

const monster = engine.createEntity({
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
})

const combatState = engine.combat(
  { members: [player] },
  { members: [monster] }
)
console.log(JSON.stringify(combatState, null, 2))
