import _ from 'lodash'
import { Engine } from '..'
import { Entity } from '../model/entity'
import { Equip } from '../model/equip'
import { EquipStore } from '../store'
import { pairwise, startWith } from 'rxjs/operators'

export class EquipModule {
  constructor(public engine: Engine) {
    this.init()
  }

  init() {
    this.engine.entitySubjects.init.subscribe((entity) => {
      entity.equipIds
        .pipe(startWith<Equip['id'][]>([]), pairwise())
        .subscribe(([oldEquipIds, equipIds]) => {
          console.debug('update equipIds', entity.name, oldEquipIds, equipIds)
          const removeEquipIds = _.difference(oldEquipIds, equipIds)
          const addEquipIds = _.difference(equipIds, oldEquipIds)
          if (removeEquipIds.length > 0)
            console.debug(entity.name, 'remove', removeEquipIds)
          if (addEquipIds.length > 0)
            console.debug(entity.name, 'add', addEquipIds)

          oldEquipIds
            .map((id) => EquipStore[id])
            .forEach((equip) => {
              this.unequipItem(entity, equip)
            })

          addEquipIds
            .map((id) => EquipStore[id])
            .forEach((equip) => {
              this.equipItem(entity, equip)
            })
        })
    })
  }

  equipItem(entity: Entity, equip: Equip) {
    // 将物品的 modifier 都挂载上
    equip.maxHP && entity.maxHP.modifiers.push(equip.maxHP)
    equip.atk && entity.atk.modifiers.push(equip.atk)
  }

  unequipItem(entity: Entity, equip: Equip) {
    if (equip.maxHP) {
      _.remove(entity.maxHP.modifiers, equip.maxHP)
    }

    if (equip.atk) {
      _.remove(entity.atk.modifiers, equip.atk.source)
    }
  }
}
