import { random } from 'lodash-es'
import * as R from 'ramda'
import { SkillTemplateId } from '..'
import { CombatStage, Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { DamageEffect } from '../../effect'
import { Entity } from '../../entity'
import { Skill } from '../Skill'

export class FastContinuousHit extends Skill {
  get templateId() {
    return SkillTemplateId.FastContinuousHit
  }
  static displayName = '快速连击'
  get description() {
    return `对单体目标造成 2 ~ ${this.maxHitCount} 次的 0.8 * atk 的伤害，可附加攻击特效`
  }

  get maxHitCount() {
    return 4 + this.level
  }

  canSilent = true
  canDisarm = true

  use(): boolean {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner
    const target = this.stage.getFirstAliveEnemy(source)
    if (target == null) return false

    const effectGroupId = createUniqueId()
    const damages = R.range(0, random(2, this.maxHitCount)).map(() => {
      const damage = new DamageEffect(effectGroupId)
      damage.baseValue = source.atk.value * 0.8
      damage.canAddAttackEffect = true
      return damage
    })

    source.buffs.forEach((buff) => buff.onCaptureEffectsSending(damages))

    const damageValues = damages.map((damage) =>
      damage.cast(this.stage, target)
    )
    console.log(
      `[${source.name}] 对 [${target.name}] 释放 [${
        this.displayName
      }]，造成 ${damageValues.join('、')} 伤害，剩余 hp ${target.currentHP}`
    )

    return true
  }

  static deserialize(
    data: Skill.Serialized,
    owner: Entity,
    stage: Stage
  ): FastContinuousHit {
    const skill = new this(stage, owner)
    skill.level = data.level
    return skill
  }
}
