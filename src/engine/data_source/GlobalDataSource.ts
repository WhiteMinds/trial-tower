import { EventEmitter } from 'eventemitter3'
import { DataManager, DataManager$InitWithStore } from './DataManager'
import { DataSource, Entity, Item, Skill } from './types'

type GlobalDataSourceEventTypes = {
  EntityCreated: [Entity]
  ItemCreated: [Item]
}

export class GlobalDataSource
  extends EventEmitter<GlobalDataSourceEventTypes>
  implements DataSource {
  entities: DataManager<Entity, Entity.Serialized>
  items: DataManager<Item, Item.Serialized>
  skills: DataManager<Skill, Skill.Serialized>
  // buffs

  constructor() {
    super()

    this.entities = new DataManager$InitWithStore(Entity, this)
    this.items = new DataManager$InitWithStore(Item, this)
    this.skills = new DataManager$InitWithStore(Skill, this)

    this.entities.on('ItemAdded', (entity) =>
      this.emit('EntityCreated', entity),
    )
    this.items.on('ItemAdded', (item) => this.emit('ItemCreated', item))
  }
}
