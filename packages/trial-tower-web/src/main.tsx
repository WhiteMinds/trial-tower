import { Button, Popover, Stack, Typography } from '@mui/material'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { CombatLog, Snapshot } from 'hedra-engine'
import { MessageWidgets } from './widgets'
import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from 'material-ui-popup-state/hooks'
import {
  Character,
  gameServerSvc,
} from './services/GameServerService/HttpGameServerService'
import { useAsyncFn } from 'react-use'

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
  const [username, setUsername] = useState('test')
  const [password, setPassword] = useState('test')
  const [reqStateWithAuth, auth] = useAsyncFn(async () => {
    const { user } = await gameServerSvc.auth(username, password)
    void refreshCharacters()
    return user
  }, [username, password])
  const [reqStateWithReg, reg] = useAsyncFn(async () => {
    const { user } = await gameServerSvc.register(username, password)
    void refreshCharacters()
    return user
  }, [username, password])

  const [reqStateWithList, refreshCharacters] = useAsyncFn(
    () => gameServerSvc.getCharacters(),
    []
  )

  const [newCharacterName, setNewCharacterName] = useState('')
  const [reqStateWithCreate, createNewCharacter] = useAsyncFn(async () => {
    const character = await gameServerSvc.createCharacter(newCharacterName)
    // TODO: 先临时这样写下
    gameServerSvc.character = character
    props.onSelect?.(character)
    return character
  }, [props.onSelect, newCharacterName])

  // // TODO: test code
  // useEffect(() => {
  //   if (characters[0]) props.onSelect?.(characters[0])
  // }, [characters])

  return (
    <div>
      {!reqStateWithAuth.value ? (
        <>
          <h3>注册登录</h3>
          <input
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button disabled={reqStateWithAuth.loading} onClick={auth}>
            {reqStateWithAuth.loading ? '正在登录' : '登录'}
          </button>
          <button disabled={reqStateWithReg.loading} onClick={reg}>
            {reqStateWithReg.loading ? '正在注册' : '注册'}
          </button>
        </>
      ) : (
        <>
          <h3>选择已有角色：</h3>
          {reqStateWithList.loading
            ? 'loading'
            : reqStateWithList.error
            ? reqStateWithList.error.message
            : reqStateWithList.value?.map((character) => (
                <h4
                  key={character.id}
                  style={{
                    color: '-webkit-link',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    // TODO: 先临时这样写下
                    gameServerSvc.character = character
                    props.onSelect?.(character)
                  }}
                >
                  {character.name}
                </h4>
              ))}

          <h3>创建新角色</h3>
          <input
            value={newCharacterName}
            onChange={(e) => setNewCharacterName(e.target.value)}
          />
          <button
            disabled={reqStateWithCreate.loading}
            onClick={createNewCharacter}
          >
            {reqStateWithCreate.loading ? '正在创建' : '创建'}
          </button>
        </>
      )}
    </div>
  )
}

const GameScreen: FC<{ character: Character }> = (props) => {
  const { character } = props

  const [reqStateWithCombat, randomCombat] = useAsyncFn(
    () => gameServerSvc.createRandomCombat(),
    []
  )
  const combatLogs = reqStateWithCombat.value?.combatLogs ?? []

  // TODO: test code
  useEffect(() => {
    randomCombat()
  }, [])

  const player = character.entity
  console.log('player snapshot on render', player)

  return (
    <div>
      <div>昵称：{player.name}</div>
      <div>等级：{player.level}</div>
      <Stack spacing={2}>
        <EquipButton />
        <InventoryButton />

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

const EquipButton: FC = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })

  const player = gameServerSvc.character!.entity

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

const InventoryButton: FC = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })
  const [, rerender] = useRerender()

  const player = gameServerSvc.character!.entity

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
                  onClick={async () => {
                    const { success } = await gameServerSvc.useItem(item.id)
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
