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
  const enemy2 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
  if (enemy2.name === enemy1.name) enemy2.name += ' 2'
  engine.mainStage.beginCombat(player, [enemy1, enemy2])
}

test()
