import React from 'react'
import ReactDOM from 'react-dom'
import { Engine } from './engine'

ReactDOM.render(
  <React.StrictMode>
    <div>test</div>
  </React.StrictMode>,
  document.getElementById('root')
)

function test() {
  const characters = Engine.getCharacters()
  const character =
    characters[0] ?? Engine.createCharacter({ name: 'WhiteMind' })
  const engine = new Engine(character)
  const player = engine.mainStage.getPlayer()
  const enemy1 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
  enemy1.name = '🦊'
  const enemy2 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
  enemy2.name = '🐒'
  engine.mainStage.beginCombat(player, [enemy1, enemy2])
}

test()
