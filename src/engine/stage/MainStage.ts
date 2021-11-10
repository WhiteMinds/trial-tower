import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { createStageStore, StageStore } from './store'
import { Item, Stage } from './types'

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

  getItem(id: Item['id']): Item | null {
    return this.store.state$.value.items[id] ?? null
  }

  getItem$(id: Item['id']): Observable<Item | null> {
    return this.store.state$.pipe(
      map((state) => {
        return state.items[id] ?? null
      }),
    )
  }
}
