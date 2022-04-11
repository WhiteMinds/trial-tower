import { Op } from 'sequelize'
import { Character, User } from '../model'
import { getUser } from './user'

export async function createCharacter(
  nickname: Character['nickname'],
  entityId: Character['entityId']
): Promise<Character> {
  return Character.create({
    nickname,
    entityId,
  })
}

export async function getCharacter(
  id: Character['id']
): Promise<Character | null> {
  return Character.findByPk(id)
}

export async function getCharacterAndVerifyByUser(
  userId: User['id'],
  characterId: Character['id']
): Promise<Character | null> {
  const user = await getUser(userId)
  if (!user?.hasCharacter(characterId)) return null
  const character = await Character.findByPk(characterId)
  return character ?? null
}

export async function updateCharacter(
  id: Character['id'],
  attrs: Partial<Character>
): Promise<void> {
  await Character.update(attrs, {
    where: {
      id: {
        [Op.eq]: id,
      },
    },
  })
}
