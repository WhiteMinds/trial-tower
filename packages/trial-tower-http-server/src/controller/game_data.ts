import { Op } from 'sequelize'
import { GameData } from '../model'

export async function createGameData(json: GameData['json']): Promise<GameData> {
  return GameData.create({ json })
}

export async function getGameData(id: GameData['id']): Promise<GameData | null> {
  return GameData.findByPk(id)
}

export async function updateGameData(id: GameData['id'], json: GameData['json']): Promise<void> {
  await GameData.update(
    { json },
    {
      where: {
        id: {
          [Op.eq]: id,
        },
      },
    },
  )
}
