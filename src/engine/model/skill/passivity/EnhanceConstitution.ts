import { SkillTemplateId } from '..'
import { CombatStage, Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { EnhanceConstitutionBuff } from '../../buff'
import { DamageEffect, GrantBuffEffect } from '../../effect'
import { Entity } from '../../entity'
import { Skill } from '../Skill'

export class EnhanceConstitution extends Skill {
  get templateId() {
    return SkillTemplateId.EnhanceConstitution
  }
  static displayName = '体质强化'
  get description() {
    return `提升 ${this.enhancePctCount * 100}% 的体质`
  }

  get enhancePctCount() {
    return (9 + this.level) / 100
  }

  canSilent = false
  canDisarm = false

  onCasted(): void {
    this.assertOwner()

    // const source = this.owner
    const target = this.owner

    const effectGroupId = createUniqueId()
    const effect = new GrantBuffEffect(
      effectGroupId,
      new EnhanceConstitutionBuff(target, this.enhancePctCount)
    )

    effect.cast(this.stage, target)
  }

  static deserialize(
    data: Skill.Serialized,
    owner: Entity,
    stage: Stage
  ): EnhanceConstitution {
    const skill = new this(stage, owner)
    skill.level = data.level
    return skill
  }
}
