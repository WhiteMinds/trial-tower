import { createStageStore, StageStore } from './store'
import { Stage } from './types'

export class MainStage implements Stage {
  store: StageStore

  // entities: ObjectManager<Entity, Entity.Serialized>
  // items: ObjectManager<Item, Item.Serialized>
  // skills: ObjectManager<Skill, Skill.Serialized>
  // TODO: buffs

  constructor() {
    this.store = createStageStore({})

    // this.entities.on('ItemAdded', (entity) =>
    //   this.emit('EntityCreated', entity),
    // )
    // this.items.on('ItemAdded', (item) => this.emit('ItemCreated', item))
  }
}
