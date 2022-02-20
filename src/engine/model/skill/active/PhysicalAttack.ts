import { Skill, SkillTemplateIds } from '..'
import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { DamageEffect } from '../../effect'
import { Entity } from '../../entity'

export class PhysicalAttack extends Skill {
  static templateId = SkillTemplateIds.PhysicalAttack
  static displayName = '普通攻击（物理）'
  static description = '对单体目标造成 1 * atk 的伤害，可附加攻击特效'

  // 沉默无效的
  canSilent = false
  // 缴械有效的
  canDisarm = true
  // 上面两个属性理论上应该和 canUse 挂钩

  use(stage: Stage, source: Entity, targets: Entity[]): void {
    const effectGroupId = createUniqueId()
    const damage = new DamageEffect(effectGroupId)
    damage.value = source.atk.value
    damage.canAddAttackEffect = true
    const effects = [damage]
    // effects 上可能需要记录 targets？还是说每个 target 生成一次 effect？
    // TODO: emit effects created, stage.emit('useSkill', skill, effects)
    // TODO: apply effects, combine(baseValue() + modifiers())
  }
}
