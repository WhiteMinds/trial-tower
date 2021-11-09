import { EventEmitter } from 'eventemitter3'
import { Entity } from '../model/entity'
import { Store } from '../utils/RxStore'
import { ObjectManager, ObjectManager$InitWithStore } from './ObjectManager'
import { createStageStore, StageStore } from './store'
import { Stage, Item, Skill, StageEventTypes } from './types'

type MainStageEventTypes = {}

export class MainStage {
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
