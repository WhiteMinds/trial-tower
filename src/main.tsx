import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { Character, Engine } from './engine'
import { CombatLog, Snapshot } from './engine/model/combat_log'
import { MessageWidgets } from './widgets'

const App: FC = () => {
  const [character, setCharacter] = useState<Character>()

  return character == null ? (
    <CharacterSelectScreen onSelect={setCharacter} />
  ) : (
    <GameScreen character={character} />
  )
}

const CharacterSelectScreen: FC<{
  onSelect?: (character: Character) => void
}> = (props) => {
  const characters = useMemo(() => Engine.getCharacters(), [])
  const [newCharacterName, setNewCharacterName] = useState('')

  const createNewCharacter = useCallback(() => {
    const c = Engine.createCharacter({ name: newCharacterName })
    props.onSelect?.(c)
  }, [newCharacterName, props.onSelect])

  // TODO: test code
  useEffect(() => {
    if (characters[0]) props.onSelect?.(characters[0])
  }, [characters])

  return (
    <div>
      <h3>选择已有角色：</h3>
      {characters.map((c) => (
        <h4 key={c.id} onClick={() => props.onSelect?.(c)}>
          {c.name}
        </h4>
      ))}
      <h3>创建新角色</h3>
      <input
        value={newCharacterName}
        onChange={(e) => setNewCharacterName(e.target.value)}
      />
      <button onClick={createNewCharacter}>创建</button>
    </div>
  )
}

const GameScreen: FC<{ character: Character }> = (props) => {
  const { character } = props
  const engine = useMemo(() => new Engine(character), [character])
  const player = useMemo(() => engine.mainStage.getPlayer(), [engine])

  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([])

  const randomCombat = useCallback(() => {
    const enemy1 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
    const enemy2 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
    if (enemy2.name === enemy1.name) enemy2.name += ' 2'
    const logs = engine.mainStage.beginCombat(player, [enemy1, enemy2])
    setCombatLogs(logs)
  }, [])

  // TODO: test code
  useEffect(() => {
    randomCombat()
  }, [])

  return (
    <div>
      <div>昵称：{player.name}</div>
      <div>等级：{player.level}</div>
      <button onClick={randomCombat}>随机战斗</button>
      {combatLogs.map((log, idx) => (
        <p key={idx}>
          <CombatLogView log={log} />
        </p>
      ))}
    </div>
  )
}

const CombatLogView: FC<{ log: CombatLog }> = (props) => {
  return (
    <>
      {props.log.map((item, idx) => {
        if (typeof item === 'string') return item
        return <SnapshotCard key={idx} snapshot={item} />
      })}
    </>
  )
}

const SnapshotCard: FC<{ snapshot: Snapshot }> = (props) => {
  switch (props.snapshot.snapshotType) {
    case 'Entity':
      return <MessageWidgets.Entity entity={props.snapshot} />
    case 'Skill':
      return <MessageWidgets.Skill skill={props.snapshot} />
    case 'Item':
      return <MessageWidgets.Item item={props.snapshot} />
    case 'Loot':
      return <MessageWidgets.Loot loot={props.snapshot} />
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
