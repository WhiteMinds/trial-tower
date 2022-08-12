import { Engine, Store } from 'hedra-engine'
import * as Hedra from 'hedra-engine'
import { Router } from 'express'
import { getTokenPayload, respond } from './utils'
import { assert, assertNumberType, assertStringType, omit } from '../utils'
import * as controller from '../controller'
import { UniqueConstraintError } from 'sequelize'
import { equalUniqueId } from 'packages/hedra-engine/src/utils'

const store: Store<number> = {
  async createData<T extends { id?: number }>(data: T) {
    const model = await controller.createGameData(omit(data, 'id'))
    const newData = { ...(model.json as T), id: model.id }
    return newData
  },
  async setData(key, data) {
    await controller.updateGameData(key, omit(data, 'id'))
  },
  async getData<T extends { id: number }>(key: number) {
    const model = await controller.getGameData(key)
    return model ? ({ ...model.json, id: model.id } as T) : null
  },
  async updateData(key, updater) {
    this.setData(key, updater(await this.getData(key)))
  },

  async createCharacter(data) {
    assertNumberType(data.entityId)
    const model = await controller.createCharacter(data.name, data.entityId)
    const character: Hedra.Character = {
      id: model.id,
      name: model.nickname,
      entityId: model.entityId,
    }
    return character
  },
  async setCharacter(key, data) {
    assertNumberType(key)
    if (data.entityId) assertNumberType(data.entityId)
    await controller.updateCharacter(key, {
      nickname: data.name,
      entityId: data.entityId as number | undefined,
    })
  },
  async getCharacter(key: number) {
    const model = await controller.getCharacter(key)
    if (model == null) return null
    const character: Hedra.Character = {
      id: model.id,
      name: model.nickname,
      entityId: model.entityId,
    }
    return character
  },
  async updateCharacter(key, updater) {
    this.setCharacter(key, updater(await this.getCharacter(key)))
  },
}
const engine = new Engine(store)

// TODO: 一个开发时的临时方案
const saveBeforeExit = async () => {
  try {
    console.log('saving engine data')
    await engine.destroy()
    console.log('saved engine data')
  } catch (err) {
    console.error(err)
  }
  process.exit()
}
// cmd + c
process.on('SIGINT', saveBeforeExit)
// nodemon restart
process.on('SIGUSR2', saveBeforeExit)

export const router = Router()

router
  .route('/characters')
  .get(async (req, res) => {
    const payload = getTokenPayload(req)
    const user = await controller.getUser(payload.id)
    assert(user)

    const characterModels = await user.getCharacters()
    const characters = await Promise.all(
      characterModels.map(async ({ id }) => {
        const character = await engine.getCharacter(id)
        assert(character)
        const entity = await engine.mainStage.getEntity(character.entityId)
        assert(entity)
        return {
          ...character,
          entity: entity.createSnapshot(),
        }
      })
    )

    respond(res, { payload: characters })
  })
  .post(async (req, res) => {
    const payload = getTokenPayload(req)
    const user = await controller.getUser(payload.id)
    assert(user)

    const { name } = req.body ?? {}
    assertStringType(name, 'param wrong')
    assert(name.length <= 16, 'param wrong')

    try {
      const character = await engine.createCharacter(
        {
          name,
        },
        async (stage) => stage.createNewPlayerEntity(name)
      )
      assertNumberType(character.id)
      const characterModel = await controller.getCharacter(character.id)
      assert(characterModel)
      await user.addCharacter(characterModel.id)
      const entity = await engine.mainStage.getEntity(character.entityId)
      assert(entity)

      respond(res, {
        payload: {
          ...character,
          entity: entity.createSnapshot(),
        },
      }).status(201)
    } catch (err) {
      if (err instanceof UniqueConstraintError && 'nickname' in err.fields) {
        respond(res, { error: 'param wrong', displayMsg: '角色昵称重复' })
        return
      }
      throw err
    }
  })

router.route('/combats').post(async (req, res) => {
  const payload = getTokenPayload(req)

  const { characterId } = req.body ?? {}
  assertNumberType(characterId, 'param wrong')
  const characterModel = await controller.getCharacterAndVerifyByUser(
    payload.id,
    characterId
  )
  assert(characterModel, 'param wrong')

  const character = await engine.getCharacter(characterModel.id)
  assert(character)
  const player = await engine.mainStage.getEntity(character.entityId)
  assert(player)

  const enemy1 = await engine.mainStage.createRandomEnemyByPlayerLevel(player)
  const enemy2 = await engine.mainStage.createRandomEnemyByPlayerLevel(player)
  const combatLogs = await engine.mainStage.beginCombat(player, [
    enemy1,
    enemy2,
  ])

  respond(res, {
    payload: {
      combatLogs,
      player: player.createSnapshot(),
    },
  }).status(201)
})

router.route('/items/:id/use').post(async (req, res) => {
  const payload = getTokenPayload(req)

  const { characterId } = req.body ?? {}
  assertNumberType(characterId, 'param wrong')
  const characterModel = await controller.getCharacterAndVerifyByUser(
    payload.id,
    characterId
  )
  assert(characterModel, 'param wrong')

  const character = await engine.getCharacter(characterModel.id)
  assert(character)
  const player = await engine.mainStage.getEntity(character.entityId)
  assert(player)

  const item = player.items.find((item) =>
    equalUniqueId(item.id, req.params.id)
  )
  if (item == null) {
    respond(res, {
      error: "Can't find item",
      displayMsg: '未找到使用的物品',
    }).status(400)
    return
  }

  const success = await item.use()

  respond(res, {
    payload: {
      success,
      player: player.createSnapshot(),
    },
  }).status(201)
})
