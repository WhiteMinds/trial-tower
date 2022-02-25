import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { EnhanceConstitutionBuff } from '../../buff'
import { GrantBuffEffect } from '../../effect'
import { Entity } from '../../entity'
import { Skill } from '../Skill'

export class EnhanceConstitution extends Skill {
  get displayName() {
    return '体质强化'
  }
  get description() {
    return `提升 ${this.enhancePctCount * 100}% 的体质`
  }

  readonly canSilent = false

  get enhancePctCount() {
    return (10 * this.level) / 100
  }

  // TODO: entity 的赋予或许应该单独写个 skill.cast 函数，否则 onCasted 覆写后可能忘记赋予
  onCasted(entity: Entity): void {
    super.onCasted(entity)
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
}
