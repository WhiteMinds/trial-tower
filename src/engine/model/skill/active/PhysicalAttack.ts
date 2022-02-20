import { SkillTemplateId } from '..'
import { CombatStage, Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { DamageEffect } from '../../effect'
import { Entity } from '../../entity'
import { Skill } from '../Skill'

export class PhysicalAttack extends Skill {
  // static templateId = SkillTemplateId.PhysicalAttack
  get templateId() {
    return SkillTemplateId.PhysicalAttack
  }
  static displayName = '普通攻击（物理）'
  static description = '对单体目标造成 1 * atk 的伤害，可附加攻击特效'

  // 沉默无效的
  canSilent = false
  // 缴械有效的
  canDisarm = true
  // 上面两个属性理论上应该和 canUse 挂钩

  use(): boolean {
    if (!(this.stage instanceof CombatStage)) {
      throw new Error(`The ${this.templateId} skill can only be used in combat`)
    }

    const source = this.owner
    const target = this.stage.getFirstAliveEnemy(source)
    if (target == null) return false

    const effectGroupId = createUniqueId()
    const damage = new DamageEffect(effectGroupId)
    damage.baseValue = source.atk.value
    damage.canAddAttackEffect = true
    // const effects = [damage]

    // effects 上可能需要记录 targets？还是说每个 target 生成一次 effect？
    // TODO: emit effects created, stage.emit('useSkill', skill, effects)
    // TODO: apply effects, combine(baseValue() + modifiers())
    const damageValue = damage.apply(this.stage, target)
    console.log(
      `${source.name} 对 ${target.name} 释放 ${this.displayName}，造成 ${damageValue} 伤害，剩余 hp ${target.currentHP}`
    )

    return true
  }

  static deserialize(
    data: Skill.Serialized,
    owner: Entity,
    stage: Stage
  ): PhysicalAttack {
    const skill = new PhysicalAttack(owner, stage)
    skill.level = data.level
    return skill
  }
}
