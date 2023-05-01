import { Equip, EquipSlot, EquipRequired } from 'hedra-engine'
import { SkillTemplateId } from '../../skills'

export class FireWand extends Equip {
  get slot(): EquipSlot {
    return EquipSlot.MainHead
  }
  get name() {
    return '火魔杖'
  }
  get description(): string {
    return `着火的木质魔杖？\n${super.description}`
  }
  get required(): EquipRequired {
    return {
      level: 1,
    }
  }

  atkModifier = { add: 1 }

  skillModifiers = [{ skillTemplateId: SkillTemplateId.Fireballs, upgradeLevel: 1 }]
}
