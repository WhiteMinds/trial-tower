import { DataManager } from './DataManager'

export interface Item {
  id: string
  name: string
  // ... other attrs ...
}

export interface Skill {
  id: string
  name: string
  // ... other attrs ...
}

export interface Entity {
  id: string
  name: string

  // test attrs
  attrPoint: number
  strength: number
  constitution: number

  hp: number
  maxHP: number
}

export interface DataSource {
  entities: DataManager<Entity>
  items: DataManager<Item>
  skills: DataManager<Skill>
}
