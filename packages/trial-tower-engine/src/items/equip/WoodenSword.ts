import { Equip, EquipRequired, EquipSlot } from 'hedra-engine'

export class WoodenSword extends Equip {
  get slot(): EquipSlot {
    return EquipSlot.MainHead
  }
  get name() {
    return '木剑'
  }
  get description(): string {
    return `木质的剑\n${super.description}`
  }
  get required(): EquipRequired {
    return {
      level: 1,
    }
  }

  atkModifier = { add: 1 }
}
