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
  get description() {
    return `下 ${this.enhanceCount} 次攻击伤害提升 100%`
  }

  get enhanceCount() {
    return 2 + this.level
  }

  canSilent = true
  canDisarm = false

  use(): boolean {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner
    const target = this.owner

    const effectGroupId = createUniqueId()
    const effect = new GrantBuffEffect(
      effectGroupId,
      new ConcentrateBuff(target, this.enhanceCount)
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
    const skill = new this(stage, owner)
    skill.level = data.level
    return skill
  }
}
