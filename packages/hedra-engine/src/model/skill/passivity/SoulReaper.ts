import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { EnhanceConstitutionBuff, SoulReaperBuff } from '../../buff'
import { GrantBuffEffect } from '../../effect'
import { Entity } from '../../entity'
import { Skill } from '../Skill'

export class SoulReaper extends Skill {
  get name() {
    return '灵魂收割者'
  }
  get description() {
    return `每击杀一个怪物，提升 ${this.healthPerMonster} 点最大生命值，当前提升：${this.increasedCount}`
  }

  readonly canSilent = false

  killCount = 0

  get healthPerMonster() {
    return this.level
  }

  get increasedCount() {
    return this.killCount * this.healthPerMonster
  }

  serialize(): SoulReaper.Serialized {
    return {
      ...super.serialize(),
      killCount: this.killCount,
    }
  }

  static deserialize(data: SoulReaper.Serialized, stage: Stage): SoulReaper {
    // TODO: 这里因为实现问题，不能直接调用 super
    const skill = new this(stage)
    skill.level = data.level
    skill.killCount = data.killCount
    return skill
  }

  onCasted(entity: Entity): void {
    super.onCasted(entity)
    this.assertOwner()

    const target = this.owner

    const effectGroupId = createUniqueId()
    const effect = new GrantBuffEffect(
      effectGroupId,
      new SoulReaperBuff(target, this.increasedCount)
    )

    effect.cast(this.stage, target)
  }

  canUse(): boolean {
    return false
  }

  onKill(entity: Entity): void {
    this.killCount++
    this.dirty()
    // TODO: 更新 SoulReaperBuff
    this.assertOwner()
    const target = this.owner

    const effectGroupId = createUniqueId()
    const effect = new GrantBuffEffect(
      effectGroupId,
      new SoulReaperBuff(target, this.increasedCount)
    )

    effect.cast(this.stage, target)
  }
}

export namespace SoulReaper {
  export interface Serialized extends Skill.Serialized {
    killCount: number
  }
}
