import {
  Avatar,
  Button,
  Box,
  Card,
  CardContent,
  CardHeader,
  Popover,
  LinearProgress,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { CombatLog, Entity, Snapshot } from 'hedra-engine'
import { useAsyncFn } from 'react-use'
import { LoadingButton } from '@mui/lab'
import IconCombat from '@mui/icons-material/GpsFixed'
import { MessageWidgets } from './widgets'
import { assert, assertNumberType } from './utils'
import { ServiceContextProvider, useGameService } from './services'
import { getItemAssetComp, getSkillAssetComp } from './assets'
import './style/app.css'
import { HttpGameServer } from './services/GameService/servers/HttpGameServer'
import { useBehaviorSubject } from './hooks/useBehaviorSubject'

const App: FC = () => {
  const { gameSvc } = useGameService()
  const character = useBehaviorSubject(gameSvc.character$)
  console.log('character', character)
  return character == null ? <CharacterSelectScreen /> : <GameScreen />
}

const CharacterSelectScreen: FC = props => {
  const { gameSvc, mode, setMode } = useGameService()

  const [username, setUsername] = useState('test')
  const [password, setPassword] = useState('test')
  const [reqStateWithAuth, auth] = useAsyncFn(async () => {
    assert(gameSvc instanceof HttpGameServer)
    const { user } = await gameSvc.auth(username, password)
    void refreshCharacters()
    return user
  }, [gameSvc, username, password])
  const [reqStateWithReg, reg] = useAsyncFn(async () => {
    assert(gameSvc instanceof HttpGameServer)
    const { user } = await gameSvc.register(username, password)
    void refreshCharacters()
    return user
  }, [gameSvc, username, password])

  const [reqStateWithList, refreshCharacters] = useAsyncFn(() => gameSvc.getCharacters(), [gameSvc])

  const [newCharacterName, setNewCharacterName] = useState('')
  const [reqStateWithCreate, createNewCharacter] = useAsyncFn(async () => {
    const character = await gameSvc.createCharacter(newCharacterName)
    gameSvc.updateCharacter(character)
    return character
  }, [gameSvc, newCharacterName])

  // TODO: test code
  useEffect(() => {
    if (!import.meta.env.AUTO_LOCAL) return
    if (mode !== 'local') {
      setMode('local')
    } else if (newCharacterName === '') {
      setNewCharacterName('test')
    } else {
      createNewCharacter()
    }
  }, [mode, newCharacterName])

  return (
    <div>
      {mode === 'online' && !reqStateWithAuth.value ? (
        <>
          <h3>注册登录</h3>
          <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
          <br />
          <input placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
          <br />
          <button disabled={reqStateWithAuth.loading} onClick={auth}>
            {reqStateWithAuth.loading ? '正在登录' : '登录'}
          </button>
          <button disabled={reqStateWithReg.loading} onClick={reg}>
            {reqStateWithReg.loading ? '正在注册' : '注册'}
          </button>
          <button onClick={() => setMode('local')}>本地游玩</button>
        </>
      ) : (
        <>
          <h3>选择已有角色：</h3>
          {reqStateWithList.loading
            ? 'loading'
            : reqStateWithList.error
            ? reqStateWithList.error.message
            : reqStateWithList.value?.map(character => (
                <h4
                  key={character.id}
                  style={{
                    color: '-webkit-link',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    gameSvc.updateCharacter(character)
                  }}
                >
                  {character.name}
                </h4>
              ))}

          <h3>创建新角色</h3>
          <input value={newCharacterName} onChange={e => setNewCharacterName(e.target.value)} />
          <button disabled={reqStateWithCreate.loading} onClick={createNewCharacter}>
            {reqStateWithCreate.loading ? '正在创建' : '创建'}
          </button>
        </>
      )}
    </div>
  )
}

const GameScreen: FC = memo(props => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <PlayerPanel />

      <CombatPanel />
    </div>
  )
})

const PlayerPanel: FC = props => {
  const { gameSvc } = useGameService()

  const character = useBehaviorSubject(gameSvc.character$)
  const player = character?.entity
  const [currentHP, setCurrentHP] = useState(0)
  useEffect(() => setCurrentHP(player?.maxHP ?? 0), [player?.maxHP])
  const combatEntities = useBehaviorSubject(gameSvc.combatEntities$)
  useEffect(() => {
    if (player == null) return
    const { currentHP } = combatEntities.find(({ id }) => id === player.id) ?? {
      currentHP: player.maxHP,
    }
    setCurrentHP(currentHP)
  }, [combatEntities])

  const [tab, setTab] = useState(0)
  const handleTabChange = (event: unknown, newValue: number) => {
    setTab(newValue)
  }

  if (player == null) return null

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Card sx={{ minWidth: 240 }}>
        <CardHeader
          avatar={<Avatar aria-label="recipe">{player.name}</Avatar>}
          title={`${player.name} (LV. ${player.level})`}
          subheader={`${player.gold} Gold`}
        />
        <CardContent style={{ paddingTop: 0 }}>
          <Typography variant="body2" color="red">
            HP ({currentHP} / {player.maxHP})
          </Typography>
          <LinearProgress variant="determinate" color="error" value={Math.round((currentHP / player.maxHP) * 100)} />
          <Typography variant="body2" color="green" style={{ marginTop: 8 }}>
            Exp ({player.exp} / 100)
          </Typography>
          <LinearProgress variant="determinate" color="success" value={(player.exp / 100) * 100} />
          {/* TODO: 属性放到右侧面板 */}
          {/* 剩余属性点 */}
          <Stack spacing={1} style={{ marginTop: 12 }}>
            <Typography variant="body2">力量：{player.strength}</Typography>
            <Typography variant="body2">体质：{player.constitution}</Typography>
            <Typography variant="body2">速度：{player.speed}</Typography>
            <Typography variant="body2">攻击：{player.atk}</Typography>
          </Stack>
          <Divider style={{ marginTop: 8 }} />
          <Stack direction="row" spacing={1} style={{ marginTop: 8 }}>
            {player.equips.map(equip => {
              const Icon = getItemAssetComp(equip)
              return (
                <MessageWidgets.Item key={equip.id} item={equip} style={{ margin: '' }}>
                  <div style={{ width: 32, height: 32 }}>
                    <Icon style={{ width: '100%', border: '1px solid #aaa' }} />
                  </div>
                </MessageWidgets.Item>
              )
            })}
            {new Array(5).fill(0).map((_, i) => {
              return <div key={i} style={{ width: 32, height: 32, border: '1px solid #aaa' }} />
            })}
          </Stack>
        </CardContent>
      </Card>

      <Card style={{ flex: 1 }}>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: 'background.paper',
            display: 'flex',
            height: '100%',
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tab}
            onChange={handleTabChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="背包" {...a11yProps(0)} />
            <Tab label="技能" {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={tab} index={0}>
            <Stack direction="row" spacing={2}>
              {player.items.map(item => {
                const Icon = getItemAssetComp(item)
                return (
                  <MessageWidgets.Item key={item.id} item={item} style={{ margin: '' }}>
                    <div style={{ width: 32, height: 32 }}>
                      <Icon
                        style={{
                          width: '100%',
                          border: '1px solid #aaa',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </MessageWidgets.Item>
                )
              })}
            </Stack>
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <Stack direction="row" spacing={2}>
              {player.skills.map(skill => {
                const Icon = getSkillAssetComp(skill)
                return (
                  <MessageWidgets.Skill key={skill.templateId} skill={skill} style={{ margin: '' }}>
                    <div style={{ width: 32, height: 32 }}>
                      <Icon
                        style={{
                          width: '100%',
                          border: '1px solid #aaa',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </MessageWidgets.Skill>
                )
              })}
            </Stack>
          </TabPanel>
        </Box>
      </Card>
    </div>
  )
}

const CombatPanel: FC = memo(props => {
  return (
    <Card style={{ flex: 1, padding: '0 16px 16px 16px', overflow: 'auto' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          borderBottom: '1px solid #eee',
          background: '#fff',
        }}
      >
        <CombatControl />

        <Divider />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            padding: '16px 0',
          }}
        >
          <CombatEntityList />
        </div>
      </div>

      <CombatLogList />
    </Card>
  )
})

const CombatControl: FC = memo(() => {
  const { gameSvc } = useGameService()

  const [layer, setLayer] = useState(1)
  const [autoCombat, setAutoCombat] = useState(false)
  useEffect(() => gameSvc.autoCombat$.next(autoCombat), [gameSvc, autoCombat])

  // TODO: 通过 layer 改变难度
  const randomCombat = useCallback(() => gameSvc.createRandomCombat(), [gameSvc])
  const isCombatting = useBehaviorSubject(gameSvc.isCombatting$)

  // TODO: test code
  useEffect(() => {
    randomCombat()
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '16px 0',
      }}
    >
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="layers-select">塔层</InputLabel>
        <Select
          labelId="layers-select"
          value={layer}
          label="塔层"
          size="small"
          onChange={event => {
            assertNumberType(event.target.value)
            setLayer(event.target.value)
          }}
        >
          {new Array(10).fill(0).map((val, idx) => (
            <MenuItem key={idx} value={idx + 1}>
              第 {idx + 1} 层
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <LoadingButton
        variant="contained"
        loading={isCombatting}
        loadingPosition="start"
        startIcon={<IconCombat />}
        sx={{ minWidth: 140 }}
        onClick={randomCombat}
      >
        随机战斗
      </LoadingButton>

      <FormControlLabel
        control={<Switch checked={autoCombat} onChange={e => setAutoCombat(e.target.checked)} />}
        label="自动连续战斗"
      />
    </div>
  )
})

const CombatEntityList: FC = memo(() => {
  const { gameSvc } = useGameService()
  const combatEntities = useBehaviorSubject(gameSvc.combatEntities$)

  return (
    <>
      {combatEntities.map(entity => (
        <CombatEntityView key={entity.id} entity={entity} />
      ))}
    </>
  )
})

const CombatEntityView: FC<{ entity: Entity.Snapshot }> = memo(({ entity }) => {
  return (
    <Paper
      key={entity.id}
      elevation={0}
      style={{
        minWidth: 160,
        padding: 8,
        background: '#fefefe',
        border: '1px solid #eee',
      }}
    >
      <Typography variant="body1">{entity.name}</Typography>
      <Typography variant="body2" color="red">
        HP ({entity.currentHP} / {entity.maxHP})
      </Typography>
      <LinearProgress variant="determinate" color="error" value={Math.round((entity.currentHP / entity.maxHP) * 100)} />
    </Paper>
  )
})

const CombatLogList: FC = memo(() => {
  const { gameSvc } = useGameService()
  const combatLogs = useBehaviorSubject(gameSvc.combatLogs$)

  return (
    <>
      {/* TODO: 在新增时自动滚动 */}
      {combatLogs.map((log, idx) => (
        <div key={idx} style={{ margin: '8px 0' }}>
          <CombatLogView log={log} />
        </div>
      ))}
    </>
  )
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'div'}>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  }
}

const CombatLogView: FC<{ log: CombatLog }> = memo(props => {
  return (
    <>
      {props.log.map((item, idx) => {
        if (typeof item === 'string') return item
        return <SnapshotCard key={idx} snapshot={item} />
      })}
    </>
  )
})

const SnapshotCard: FC<{ snapshot: Snapshot }> = props => {
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
    <ServiceContextProvider>
      <App />
    </ServiceContextProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
