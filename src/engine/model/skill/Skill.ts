import { SkillTemplateId, SkillTemplateMap } from '.'
import { Stage } from '../../stage'
import { Entity } from '../entity'

export class Skill {
  // 这里有循环引用的问题，先直接用 getter 了，后面应该是考虑改成 templateId 不由内部设置，
  // 而是改成 skill/index.ts 在做 map 的时候自行设置，SkillClass 只负责序列化时对其存取。
  // static templateId = SkillTemplateId.Base
  get templateId() {
    return SkillTemplateId.Base
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

  level: number = 1

  constructor(public owner: Entity, public stage: Stage) {}

  serialize(): Skill.Serialized {
    return {
      templateId: this.templateId,
      level: this.level,
    }
  }

  static deserialize(
    data: Skill.Serialized,
    owner: Entity,
    stage: Stage
  ): Skill {
    if (data.templateId === SkillTemplateId.Base) {
      const skill = new this(owner, stage)
      skill.level = data.level
      return skill
    } else {
      return SkillTemplateMap[data.templateId].deserialize(data, owner, stage)
    }
  }

  use(): boolean {
    return false
  }
}

export namespace Skill {
  export interface Serialized {
    templateId: SkillTemplateId
    level: number
  }
}
