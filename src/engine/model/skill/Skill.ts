import { SkillTemplateMap } from '.'
import { CombatStage, Stage } from '../../stage'
import { Entity } from '../entity'
import { SkillTemplateId } from './SkillTemplateId'

export class Skill {
  // 该属性会在初始化时被自动处理，所以都默认给 Base 就行
  static templateId = SkillTemplateId.Base
  get templateId() {
    return (this.constructor as typeof Skill).templateId
  }

  get displayName() {
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

  level: number = 1

  constructor(public stage: Stage) {}

  serialize(): Skill.Serialized {
    return {
      templateId: this.templateId,
      level: this.level,
    }
  }

  static deserialize(data: Skill.Serialized, stage: Stage): Skill {
    const skill = new SkillTemplateMap[data.templateId](stage)
    skill.level = data.level
    return skill
  }

  // 生命周期

  onCasted(entity: Entity) {
    this.owner = entity
  }

  canUse(): boolean {
    // TODO: 一些技能需求，比如是否装备了武器、能量是否足够消耗等
    return true
  }

  // 或者叫 onUse？
  use(): boolean {
    return false
  }

  // utils

  assertCombatStage(
    errMsg = 'Cannot pass assertCombatStage'
  ): asserts this is this & { stage: CombatStage } {
    if (!(this.stage instanceof CombatStage)) throw new Error(errMsg)
  }
  assertCombatting(): asserts this is this & { stage: CombatStage } {
    this.assertCombatStage(
      `The ${this.templateId} skill can only be used in combat`
    )
  }

  assertOwner(
    errMsg = 'Cannot pass assertOwner'
  ): asserts this is this & { owner: Entity } {
    if (this.owner == null) {
      throw new Error(errMsg)
    }
  }
}

export namespace Skill {
  export interface Serialized {
    templateId: SkillTemplateId
    level: number
  }
}
