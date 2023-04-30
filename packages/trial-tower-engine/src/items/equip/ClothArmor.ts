import { Equip, EquipSlot, EquipRequired } from 'hedra-engine'

export class ClothArmor extends Equip {
  get slot(): EquipSlot {
    return EquipSlot.Body
  }
  get name() {
    return '布甲'
  }
  get description(): string {
    return `布质的甲\n${super.description}`
  }
  get required(): EquipRequired {
    return {
      level: 1,
    }
  }

  conModifier = { add: 5 }
  maxHPModifier = { per: 0.1 }
}
