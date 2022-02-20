import { Stage } from '../../stage'
import { UniqueId } from '../../types'
import { createUniqueId } from '../../utils'

export const SkillTemplateIds = {
  Base: 'Base',
  PhysicalAttack: 'PhysicalAttack',
}

export class Skill {
  static templateId = SkillTemplateIds.Base
  get templateId() {
    return (this.constructor as typeof Skill).templateId
  }

  // 不能叫 name，会和 fn.name 冲突
  static displayName = 'UnnamedSkill'
  get displayName() {
    return (this.constructor as typeof Skill).displayName
  }

  static description = ''
  get description() {
    return (this.constructor as typeof Skill).description
  }

  id: UniqueId = createUniqueId()
  level: number = 1

  constructor(public stage: Stage, data?: Partial<Skill.Serialized>) {
    this.deserialize({
      ...this.serialize(),
      ...data,
    })
  }

  serialize(): Skill.Serialized {
    return {
      id: this.id,
      level: this.level,
    }
  }

  deserialize(data: Skill.Serialized): void {
    this.id = data.id
    this.level = data.level
  }

  static deserialize(data: Skill.Serialized, stage: Stage): Skill {
    const skill = new Skill(stage)
    skill.deserialize(data)
    return skill
  }
}

export namespace Skill {
  export interface Serialized {
    id: UniqueId
    level: number
  }
}
