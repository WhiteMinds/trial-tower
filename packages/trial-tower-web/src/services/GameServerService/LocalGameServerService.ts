import * as Hedra from 'hedra-engine'
import { assert, assertNumberType, omit } from '../../utils'
import { Character, GameServerService } from './types'

// TODO: 暂时做成内存存储，之后可以改成 indexedDB 的

const gameDataMap: Record<number, unknown> = {}
let gameDataAutoIncrementId = 1

const characterMap: Record<number, Hedra.Character> = {}
let characterAutoIncrementId = 1

function createGameData(data: Record<string, unknown>) {
  const id = gameDataAutoIncrementId++
  gameDataMap[id] = data
  return { ...data, id }
}

function createCharacter(
  nickname: Hedra.Character['name'],
  entityId: Hedra.Character['entityId']
) {
  // TODO: dup nickname check
  const id = characterAutoIncrementId++
  characterMap[id] = { id, entityId, name: nickname }
  return characterMap[id]
}

const store: Hedra.Store<number> = {
  async createData<T extends { id?: number }>(data: T) {
    return createGameData(omit(data, 'id')) as T & { id: number }
  },
  async setData(key, data) {
    gameDataMap[key] = omit(data, 'id')
  },
  async getData<T extends { id: number }>(key: number) {
    const data = gameDataMap[key]
    return data ? (data as T) : null
  },
  async updateData(key, updater) {
    this.setData(key, updater(await this.getData(key)))
  },

  async createCharacter(data) {
    return createCharacter(data.name, data.entityId)
  },
  async setCharacter(key, data) {
    assertNumberType(key)
    characterMap[key] = {
      ...characterMap[key],
      name: data.name,
      entityId: data.entityId,
    }
  },
  async getCharacter(key: number) {
    const character = characterMap[key]
    return character ?? null
  },
  async updateCharacter(key, updater) {
    this.setCharacter(key, updater(await this.getCharacter(key)))
  },
}
const engine = new Hedra.Engine(store)

class LocalGameServerService implements GameServerService {
  character?: Character

  async createCharacter(name: string) {
    assert(name.length <= 16, 'param wrong')

    const character = await engine.createCharacter(
      {
        name,
      },
      async (stage) => stage.createNewPlayerEntity(name)
    )
    const entity = await engine.mainStage.getEntity(character.entityId)
    assert(entity)

    return {
      ...character,
      entity: entity.createSnapshot(),
    }
  }

  async getCharacters() {
    return Promise.all(
      Object.values(characterMap).map(async (character) => ({
        ...character,
        entity: (await engine.mainStage.getEntity(
          character.entityId
        ))!.createSnapshot(),
      }))
    )
  }

  async createRandomCombat() {
    assert(this.character)
    const character = await engine.getCharacter(this.character.id)
    assert(character)
    const player = await engine.mainStage.getEntity(character.entityId)
    assert(player)

    const enemy1 = await engine.mainStage.createRandomEnemyByPlayerLevel(player)
    const enemy2 = await engine.mainStage.createRandomEnemyByPlayerLevel(player)
    const combatLogs = await engine.mainStage.beginCombat(player, [
      enemy1,
      enemy2,
    ])

    return {
      combatLogs,
      player: player.createSnapshot(),
    }
  }

  async useItem(itemId: Hedra.Item['id']) {
    assert(this.character)
    const character = await engine.getCharacter(this.character.id)
    assert(character)
    const player = await engine.mainStage.getEntity(character.entityId)
    assert(player)

    const item = player.items.find((item) => item.id === itemId)
    assert(item, '未找到使用的物品')

    const success = await item.use()

    return {
      success,
      player: player.createSnapshot(),
    }
  }
}

export const localGameServerService = new LocalGameServerService()
