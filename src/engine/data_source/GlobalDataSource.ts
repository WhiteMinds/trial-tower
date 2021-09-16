import { EventEmitter } from 'eventemitter3'
import { DataManager } from './DataManager'
import { DataSource, Entity, Item, Skill } from './types'

type GlobalDataSourceEventTypes = {
  EntityCreated: [Entity]
  ItemCreated: [Item]
}

export class GlobalDataSource
  extends EventEmitter<GlobalDataSourceEventTypes>
  implements DataSource {
  entities = new DataManager<Entity>()
  items = new DataManager<Item>()
  skills = new DataManager<Skill>()
  // buffs

  constructor() {
    super()

    this.entities.on('ItemAdded', (entity) =>
      this.emit('EntityCreated', entity),
    )
    this.items.on('ItemAdded', (item) => this.emit('ItemCreated', item))
  }
}
