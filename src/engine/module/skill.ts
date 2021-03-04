import produce from 'immer'
import _ from 'lodash'
import { BehaviorSubject } from 'rxjs'
import { Engine, EntityEvents } from '..'
import { Entity } from '../model/entity'
import { Equip } from '../model/equip'

export class SkillModule {
  constructor(public engine: Engine) {
    this.init()
  }

  init() {
    this.engine.addEventListener('entity_init', (event) => {
      const { entity } = event as EntityEvents.Init
      // entity.value.equips
      //   .map((id) => EquipStore[id])
      //   .forEach((equip) => {
      //     this.equipItem(entity, equip)
      //   })
    })
  }

  mount(entity: BehaviorSubject<Entity>, skill) {}

  unmount(entity: BehaviorSubject<Entity>, skill) {}
}
