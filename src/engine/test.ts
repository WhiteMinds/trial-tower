import { Engine } from '.'
import { Entity } from './model/entity'
import {
  Skill$Recovery,
  Skill$Revive,
  Skill$Spikeweed,
  Skill$Thump,
} from './model/skill'

const engine = new Engine()

const player = new Entity(engine, {
  name: 'Player',
  strength: 2,
  constitution: 2,
  speed: 1,
  maxHP: 100,
  atk: 10,
  equipIds: [0, 1],
  skills: [
    { id: Skill$Thump.id },
    { id: Skill$Recovery.id },
    { id: Skill$Spikeweed.id },
  ],
})

const monster = new Entity(engine, {
  name: 'Monster',
  strength: 2,
  constitution: 2,
  speed: 1,
  maxHP: 100,
  atk: 10,
  skills: [{ id: Skill$Revive.id }],
})
const monster2 = monster.clone()
monster2.name = 'Monster2'
monster2.atk.base = 1
monster2.speed.base = 0.5
monster2.maxHP.base = 20
const monster3 = monster2.clone()
monster3.name = 'Monster3'

const combatState = engine.combat(
  { members: [player] },
  { members: [monster, monster2, monster2] },
)
console.log(JSON.stringify(combatState, null, 2))
