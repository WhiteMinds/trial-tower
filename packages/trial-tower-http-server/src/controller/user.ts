import { Op } from 'sequelize'
import { User } from '../model'

export async function createUser(username: string, password: string): Promise<User> {
  return User.create({
    username,
    password,
  })
}

export async function getUser(id: User['id']): Promise<User | null> {
  return User.findByPk(id)
}

export async function getUserByAuth(username: string, password: string): Promise<User | null> {
  const user = await User.findOne({
    where: {
      username: {
        [Op.eq]: username,
      },
      password: {
        [Op.eq]: password,
      },
    },
  })
  return user ?? null
}
