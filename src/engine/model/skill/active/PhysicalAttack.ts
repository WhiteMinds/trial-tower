import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
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

    const effectGroupId = createUniqueId()
    const damage = new DamageEffect(this.stage, source, effectGroupId)
    damage.baseValue = source.atk.value
    damage.canAddAttackEffect = true
    // const effects = [damage]

    // effects 上可能需要记录 targets？还是说每个 target 生成一次 effect？
    // TODO: emit effects created, stage.emit('useSkill', skill, effects)
    source.getBuffs().forEach((buff) => buff.onCaptureEffectsSending([damage]))
    // TODO: apply effects, combine(baseValue() + modifiers())
    const damageValue = damage.calcValue(target)
    this.stage.logs.push([
      source.createSnapshot(),
      '对',
      target.createSnapshot(),
      '释放',
      this.createSnapshot(),
      `造成 ${damageValue} 伤害，剩余 hp ${target.currentHP}`,
    ])
    damage.cast(this.stage, target)

    return true
  }
}
