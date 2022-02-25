import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { ConcentrateBuff } from '../../buff'
import { GrantBuffEffect } from '../../effect'
import { Skill } from '../Skill'

export class Concentrate extends Skill {
  get displayName() {
    return '全神贯注'
  }
  get description() {
    return `下 ${this.enhanceCount} 次攻击伤害提升 100%`
  }

  get enhanceCount() {
    return 2 + this.level
  }

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
    console.log(`[${source.name}] 释放 [${this.displayName}]`)

    return true
  }
}