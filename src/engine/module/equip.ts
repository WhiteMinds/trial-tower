import { Entity } from '../model/entity'
import { EquipStore } from '../store'
import { CombatSystemModule } from './types'

export const module: CombatSystemModule = {
  init(sys) {
    // TODO: 将物品的 modifier 都挂载上
    // sys.on()
  },
  // onEntityInit(entity: Entity) {
  //   entity.equips.map(id => EquipStore[id]).forEach(equip => {
  //     entity.maxHP.modifiers.push(equip.maxHP)
  //     entity.atk.modifiers.push(equip.atk)
  //   })
  // },
}
