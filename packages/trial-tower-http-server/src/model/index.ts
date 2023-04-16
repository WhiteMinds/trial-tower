import { Sequelize } from 'sequelize'
import { defineUserModel } from './user'
import { defineCharacterModel } from './character'
import { defineGameDataModel } from './game_data'

export const sequelize = new Sequelize(
  process.env.DB_NAME ?? 'trial_tower',
  process.env.DB_USER ?? 'root',
  process.env.DB_PASS,
  {
    dialect: 'mysql',
    logging: (body, options) => console.debug(body),
  },
)

type ExtractInstanceType<T> = T extends { new (): infer C } ? C : never
export const User = defineUserModel(sequelize)
export type User = ExtractInstanceType<typeof User>
export const Character = defineCharacterModel(sequelize)
export type Character = ExtractInstanceType<typeof Character>
export const GameData = defineGameDataModel(sequelize)
export type GameData = ExtractInstanceType<typeof GameData>

User.hasMany(Character)
Character.belongsTo(User)

// sequelize.sync({ force: true })
sequelize.sync({ alter: true })
