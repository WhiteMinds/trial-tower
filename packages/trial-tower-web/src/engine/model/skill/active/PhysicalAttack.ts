import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { CombatLog } from '../../combat_log'
import { DamageEffect } from '../../effect'
import { Skill } from '../Skill'

export class PhysicalAttack extends Skill {
  get name() {
    return '普通攻击（物理）'
  }
  get description() {
    return '对单体目标造成 1 * atk 的伤害，可附加攻击特效'
  }

  readonly canSilent = false
  readonly canDisarm = true

  use(): boolean {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner
    const target = this.stage.getFirstAliveEnemy(source)
    if (target == null) return false

    const log: CombatLog = [
      source.createSnapshot(),
      '对',
      target.createSnapshot(),
      '释放',
      this.createSnapshot(),
    ]
    this.stage.logs.push(log)

    const effectGroupId = createUniqueId()
    const damage = new DamageEffect(this.stage, source, effectGroupId)
    damage.baseValue = source.atk.value
    damage.canAddAttackEffect = true

    // TODO: emit effects created, stage.emit('useSkill', skill, effects)
    source.getBuffs().forEach((buff) => buff.onCaptureEffectsSending([damage]))
    // TODO: apply effects, combine(baseValue() + modifiers())
    const damageValue = damage.cast(this.stage, target)
    log.push(`造成 ${damageValue} 伤害，剩余 hp ${target.currentHP}`)

    return true
  }
}
