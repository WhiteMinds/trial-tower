import { Button, Popover, Stack, Typography } from '@mui/material'
import React, {
  FC,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import ReactDOM from 'react-dom'
import { Character, Engine } from './engine'
import { CombatLog, Snapshot } from './engine/model/combat_log'
import { MessageWidgets } from './widgets'
import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from 'material-ui-popup-state/hooks'

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
  useEffect(() => {
    const beforeunload = () => engine.destroy()
    addEventListener('beforeunload', beforeunload)
    return () => removeEventListener('beforeunload', beforeunload)
  }, [engine])

  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([])

  const randomCombat = useCallback(() => {
    const player = engine.mainStage.getPlayer()
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

  const player = engine.mainStage.getPlayer().createSnapshot()
  console.log('player snapshot on render', player)

  return (
    <div>
      <div>昵称：{player.name}</div>
      <div>等级：{player.level}</div>
      <Stack spacing={2}>
        <EquipButton engine={engine} />
        <InventoryButton engine={engine} />

        <Button variant="contained" onClick={randomCombat}>
          随机战斗
        </Button>
      </Stack>
      {combatLogs.map((log, idx) => (
        <p key={idx}>
          <CombatLogView log={log} />
        </p>
      ))}
    </div>
  )
}

const EquipButton: FC<{ engine: Engine }> = (props) => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })

  const player = props.engine.mainStage.getPlayer().createSnapshot()

  return (
    <>
      <Button variant="contained" {...bindTrigger(popupState)}>
        装备栏
      </Button>
      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div style={{ padding: 16, minWidth: 200 }}>
          <Stack>
            {player.equips.map((equip) => (
              <div key={equip.id}>
                {/* TODO: 这里显示 slot 之类的 */}
                <MessageWidgets.Item item={equip} />
                <Button
                  variant="outlined"
                  onClick={() => {
                    // TODO: player.unEquip
                  }}
                >
                  卸下
                </Button>
              </div>
            ))}
          </Stack>
        </div>
      </Popover>
    </>
  )
}

const InventoryButton: FC<{ engine: Engine }> = (props) => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })
  const [, rerender] = useRerender()

  const player = props.engine.mainStage.getPlayer().createSnapshot()

  return (
    <>
      <Button variant="contained" {...bindTrigger(popupState)}>
        背包（{player.items.length}）
      </Button>
      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div style={{ padding: 16, minWidth: 200 }}>
          <Typography>库存：</Typography>
          <Stack>
            {player.items.map((item) => (
              <div key={item.id}>
                <MessageWidgets.Item item={item} /> x{item.stacked}{' '}
                <Button
                  variant="outlined"
                  onClick={() => {
                    props.engine.mainStage.getItem(item.id)?.use()
                    rerender()
                  }}
                >
                  使用
                </Button>
              </div>
            ))}
          </Stack>
        </div>
      </Popover>
    </>
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

export function useRerender(): useRerender.Ret {
  const [key, setKey] = useState(Math.random())
  const rerender = useCallback(() => setKey(Math.random()), [])

  return [key, rerender]
}

export namespace useRerender {
  export type Ret = [key: number, rerender: () => void]
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
