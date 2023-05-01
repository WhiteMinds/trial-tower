import { SkillRegistry } from '.'
import { CombatStage, Stage } from '../../stage'
import { Entity } from '../entity'

type TemplateId = number | string

export class Skill {
  static templateId: TemplateId = ''
  get templateId() {
    return (this.constructor as typeof Skill).templateId
  }

  get name() {
    return 'BaseSkill'
  }
  get description() {
    return 'BaseSkill'
  }

  protected owner?: Entity

  // 是否受沉默影响
  readonly canSilent: boolean = true
  // 是否受缴械影响
  readonly canDisarm: boolean = false
  // TODO: 上面两个属性理论上应该和 canUse 挂钩

  level = 1

  constructor(public stage: Stage) {}

  createSnapshot(): Skill.Snapshot {
    return {
      snapshotType: 'Skill',
      templateId: this.templateId,
      name: this.name,
      description: this.description,
      level: this.level,
    }
  }

  serialize(): Skill.Serialized {
    return {
      templateId: this.templateId,
      level: this.level,
    }
  }

  static deserialize(data: Skill.Serialized, stage: Stage): Skill {
    const hasCustomDeserialize = SkillRegistry[data.templateId].deserialize !== this.deserialize
    if (hasCustomDeserialize) {
      return SkillRegistry[data.templateId].deserialize(data, stage)
    }

    const skill = new SkillRegistry[data.templateId](stage)
    skill.level = data.level
    return skill
  }

  dirty() {
    this.owner?.dirty()
  }

  // 生命周期

  onCasted(entity: Entity) {
    this.owner = entity
  }

  // 只在主舞台的实例中触发
  async onCombatEnd(combatStage: CombatStage) {}

  canUse(): boolean {
    // TODO: 一些技能需求，比如是否装备了武器、能量是否足够消耗等
    return true
  }

  // 或者叫 onUse？
  async use(): Promise<boolean> {
    return false
  }

  onKill(entity: Entity): void {}

  // utils

  assertCombatStage(errMsg = 'Cannot pass assertCombatStage'): asserts this is this & { stage: CombatStage } {
    if (!(this.stage instanceof CombatStage)) throw new Error(errMsg)
  }
  assertCombatting(): asserts this is this & { stage: CombatStage } {
    this.assertCombatStage(`The ${this.templateId} skill can only be used in combat`)
  }

  assertOwner(errMsg = 'Cannot pass assertOwner'): asserts this is this & { owner: Entity } {
    if (this.owner == null) {
      throw new Error(errMsg)
    }
  }
}

export namespace Skill {
  export interface Serialized {
    templateId: TemplateId
    level: number
  }

  export interface Snapshot {
    snapshotType: 'Skill'
    templateId: TemplateId
    name: string
    description: string
    level: number
  }
}
