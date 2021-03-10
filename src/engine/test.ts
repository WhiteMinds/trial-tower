import { Engine } from '.'
import { Entity } from './model/entity'
import { Skill$Thump } from './model/skill'

const engine = new Engine()

const player = new Entity(engine, {
  name: 'Player',
  strength: 2,
  constitution: 2,
  speed: 2,
  maxHP: 100,
  atk: 10,
  equipIds: [0, 1],
  skills: [
    {
      id: Skill$Thump.id,
    },
  ],
})

const monster = new Entity(engine, {
  name: 'Monster',
  strength: 2,
  constitution: 2,
  speed: 1,
  maxHP: 100,
  atk: 10,
})

const combatState = engine.combat({ members: [player] }, { members: [monster] })
console.log(JSON.stringify(combatState, null, 2))
