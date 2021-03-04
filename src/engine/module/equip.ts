import produce from 'immer'
import _ from 'lodash'
import { BehaviorSubject } from 'rxjs'
import { Engine, EntityEvents } from '..'
import { Entity } from '../model/entity'
import { Equip } from '../model/equip'
import { EquipStore } from '../store'

export class EquipModule {
  constructor(public engine: Engine) {
    this.init()
  }

  init() {
    this.engine.addEventListener('entity_init', (event) => {
      const { entity } = event as EntityEvents.Init
      entity.value.equipIds
        .map((id) => EquipStore[id])
        .forEach((equip) => {
          this.equipItem(entity, equip)
        })
    })
  }

  equipItem(entity: BehaviorSubject<Entity>, equip: Equip) {
    // 将物品的 modifier 都挂载上
    entity.next(
      produce(entity.value, (entity) => {
        equip.maxHP && entity.maxHP.modifiers.push(equip.maxHP)
        equip.atk && entity.atk.modifiers.push(equip.atk)
      }),
    )
  }

  unequipItem(entity: BehaviorSubject<Entity>, equip: Equip) {
    entity.next(
      produce(entity.value, (entity) => {
        if (equip.maxHP) {
          _.remove(entity.maxHP.modifiers, {
            source: equip.maxHP.source,
          })
        }

        if (equip.atk) {
          _.remove(entity.atk.modifiers, {
            source: equip.atk.source,
          })
        }
      }),
    )
  }
}
