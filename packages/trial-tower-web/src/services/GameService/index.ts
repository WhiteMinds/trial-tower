import { GameServerMode, GameServer, Character } from './servers/types'
import { HttpGameServer } from './servers/HttpGameServer'
import { LocalGameServer } from './servers/LocalGameServer'
import { BehaviorSubject, Subscription } from 'rxjs'
import { CombatLog, Entity, Item } from 'hedra-engine'
import { assert, sleep } from '../../utils'

const instanceMap: Partial<Record<GameServerMode, GameService>> = {}

export function getGameService(mode: GameServerMode) {
  if (!(mode in instanceMap)) {
    instanceMap[mode] = createSvcInstance(mode)
  }
  const svc = instanceMap[mode]
  assert(svc)
  return svc
}

function createSvcInstance(mode: GameServerMode): GameService {
  const GameServerClass = mode === 'local' ? LocalGameServer : HttpGameServer

  const GameServiceClass = class GameService extends GameServerClass {
    // TODO: 这个好像不需要 subject 吗？
    autoCombat$ = new BehaviorSubject<boolean>(false)

    character$ = new BehaviorSubject<Character | null>(null)
    isCombatting$ = new BehaviorSubject<boolean>(false)
    combatLogs$ = new BehaviorSubject<CombatLog[]>([])
    combatEntities$ = new BehaviorSubject<Entity.Snapshot[]>([])

    private sub: Subscription
    destroy() {
      this.sub?.unsubscribe()
    }

    constructor() {
      super()

      this.sub = new Subscription()
      this.sub.add(
        this.character$.subscribe(character => {
          this.character = character ?? undefined
        }),
      )
    }

    updateCharacter(character: Character | null) {
      // TODO: 做 merge 来确保对象引用尽量少的变化
      this.character$.next(character)
    }

    async createRandomCombat() {
      if (this.isCombatting$.value) throw new Error('Cant create combat in combatting')
      this.isCombatting$.next(true)
      const result = await super.createRandomCombat()
      this.startCombatResultPrint(result).finally(() => {
        this.isCombatting$.next(false)
        if (this.autoCombat$.value) {
          this.createRandomCombat()
        }
      })
      return result
    }

    async useItem(itemId: Item['id']) {
      const result = await super.useItem(itemId)
      if (this.character$.value) {
        this.updateCharacter({
          ...this.character$.value,
          entity: result.player,
        })
      }
      return result
    }

    // TODO: 应该只能单例，并且支持中途强制停止
    async startCombatResultPrint({ combatLogs, player }: Awaited<ReturnType<GameServer['createRandomCombat']>>) {
      this.combatLogs$.next([])
      this.combatEntities$.next([])

      for (const combatLog of combatLogs) {
        this.combatLogs$.next([...this.combatLogs$.value, combatLog])

        const entitiesFromLog = combatLog.filter(
          (frag): frag is Entity.Snapshot => typeof frag !== 'string' && frag.snapshotType === 'Entity',
        )
        if (entitiesFromLog.length > 0) {
          const newEntities: Entity.Snapshot[] = [...this.combatEntities$.value]
          entitiesFromLog.forEach(entity => {
            const oldIdx = newEntities.findIndex(({ id }) => id === entity.id)
            if (oldIdx !== -1) {
              newEntities[oldIdx] = entity
            } else {
              newEntities.push(entity)
            }
          })
          this.combatEntities$.next(newEntities)
        }

        // TODO: 每个 log 应该要提供它的 cost，然后这里乘一个比例来得到耗时
        await sleep(100)
      }

      if (this.character$.value) {
        this.updateCharacter({ ...this.character$.value, entity: player })
      }
    }
  }

  return new GameServiceClass()
}

export interface GameService extends GameServer {
  autoCombat$: BehaviorSubject<boolean>

  character$: BehaviorSubject<Character | null>
  isCombatting$: BehaviorSubject<boolean>
  combatLogs$: BehaviorSubject<CombatLog[]>
  combatEntities$: BehaviorSubject<Entity.Snapshot[]>

  updateCharacter: (character: Character) => void
}
