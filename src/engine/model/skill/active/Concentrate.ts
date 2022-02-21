import { SkillTemplateId } from '..'
import { CombatStage, Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { ConcentrateBuff } from '../../buff'
import { DamageEffect, GrantBuffEffect } from '../../effect'
import { Entity } from '../../entity'
import { Skill } from '../Skill'

export class Concentrate extends Skill {
  get templateId() {
    return SkillTemplateId.Concentrate
  }
  static displayName = '全神贯注'
  static description = '下三次攻击伤害提升 100%'

  canSilent = true
  canDisarm = false

  use(): boolean {
    if (!(this.stage instanceof CombatStage)) {
      throw new Error(`The ${this.templateId} skill can only be used in combat`)
    }

    const source = this.owner
    const target = this.owner

    const effectGroupId = createUniqueId()
    const effect = new GrantBuffEffect(
      effectGroupId,
      new ConcentrateBuff(target)
    )

    effect.cast(this.stage, target)
    console.log(`${source.name} 释放 ${this.displayName}`)

    return true
  }

  static deserialize(
    data: Skill.Serialized,
    owner: Entity,
    stage: Stage
  ): Concentrate {
    const skill = new this(owner, stage)
    skill.level = data.level
    return skill
  }
}
