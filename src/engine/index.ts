import { BehaviorSubject, Subject } from 'rxjs'
import { CombatSystem, Team } from './combat'
import { Entity } from './model/entity'
import { EquipModule } from './module/equip'

export class Engine extends EventTarget {
  entitySubjects = {
    init: new Subject<Entity>(),
  }
  // 需要使用 entitySubjects 的 module 应该在其下方初始化，否则会拿不到
  equipModule = new EquipModule(this)

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
