import { CombatSystem } from '../combat'
import { BattlingEntity } from './entity'

export class Skill {
  id = 0
  name = 'UnnamedSkill'
  level = 1
  onUse(entity: BattlingEntity, combat: CombatSystem) {}
}

export class Skill$Thump {
  id = 1
  name = '重击'
  onUse(source: BattlingEntity, combat: CombatSystem) {
    const [targetTeam] = combat.getOtherTeams(source)
    const [target] = targetTeam.members

    const damage = source.atk.value * 2
    combat.msgs.push(
      `${source.name} 对 ${target.name} 释放了 ${this.name}，造成 ${damage} 伤害，剩余 hp ${target.currentHP}`,
    )
    target.currentHP -= damage
  }
}
