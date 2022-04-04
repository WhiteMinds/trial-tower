import { Sequelize } from 'sequelize'
import { defineUserModel } from './user'

export const sequelize = new Sequelize(
  process.env.DB_NAME ?? 'trial_tower',
  process.env.DB_USER ?? 'root',
  process.env.DB_PASS,
  {
    dialect: 'mysql',
    logging: (body, options) => console.debug(body),
  }
)

// Initialize each model in the database
// This must be done before associations are made
type ExtractInstanceType<T> = T extends { new (): infer C } ? C : never
export const User = defineUserModel(sequelize)
export type User = ExtractInstanceType<typeof User>

// Many students in each class
// Class.belongsToMany(Student, { through: 'Classes_Students'})
// Many classes for each student
// Student.belongsToMany(Class, { through: 'Classes_Students'})

// One teacher for each class
// Class.belongsTo(Teacher)
// Many classes for one teacher
// Teacher.hasMany(Class)

sequelize.sync({ alter: true })
