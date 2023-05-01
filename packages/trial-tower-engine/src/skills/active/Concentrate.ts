import { Skill, GrantBuffEffect } from 'hedra-engine'
import { ConcentrateBuff } from '../../buffs'
import { createUniqueId } from '../../utils'

export class Concentrate extends Skill {
  get name() {
    return '全神贯注'
  }
  get description() {
    return `下 ${this.enhanceCount} 次攻击伤害提升 100%`
  }

  get enhanceCount() {
    return 2 + this.level
  }

  async use(): Promise<boolean> {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner
    const target = this.owner

    const effectGroupId = createUniqueId()
    const effect = new GrantBuffEffect(effectGroupId, new ConcentrateBuff(target, this.enhanceCount))

    this.stage.logs.push([source.createSnapshot(), '释放', this.createSnapshot()])
    effect.cast(this.stage, target)

    return true
  }
}
