import { EventEmitter } from 'eventemitter3'
import { Entity } from '../model/entity'
import { ObjectManager, ObjectManager$InitWithStore } from './ObjectManager'
import { Stage, Item, Skill, StageEventTypes } from './types'

type MainStageEventTypes = {}

export class MainStage
  extends EventEmitter<StageEventTypes & MainStageEventTypes>
  implements Stage {
  entities: ObjectManager<Entity, Entity.Serialized>
  items: ObjectManager<Item, Item.Serialized>
  skills: ObjectManager<Skill, Skill.Serialized>
  // TODO: buffs

  constructor() {
    super()

    this.entities = new ObjectManager$InitWithStore(Entity, this, 'entity')
    this.items = new ObjectManager$InitWithStore(Item, this, 'item')
    this.skills = new ObjectManager$InitWithStore(Skill, this, 'skill')

    // this.entities.on('ItemAdded', (entity) =>
    //   this.emit('EntityCreated', entity),
    // )
    // this.items.on('ItemAdded', (item) => this.emit('ItemCreated', item))
  }
}
