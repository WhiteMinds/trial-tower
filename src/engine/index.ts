import { BehaviorSubject, Subject } from 'rxjs'
import { CombatSystem, Team } from './combat'
import { Entity } from './model/entity'
import { EquipModule } from './module/equip'

export class Engine extends EventTarget {
  equipModule = new EquipModule(this)

  entitySubjects = {
    init: new Subject<Entity>(),
  }

  createEntity(origin: Entity) {
    const entity = new BehaviorSubject(origin)
    this.dispatchEvent(new EntityEvents.Init(entity))
    return entity
  }

  combat(...teams: Team[]) {
    const sys = new CombatSystem(...teams)
    return sys.start()
  }
}

export namespace EntityEvents {
  export class Init extends Event {
    constructor(public entity: BehaviorSubject<Entity>) {
      super('entity_init')
    }
  }
}
