import _ from 'lodash'
import { Engine } from '..'
import { CombatSystem } from '../combat'
import { Entity } from './entity'

export class Skill {
  id = -1
  level = 1

  constructor(public entity: Entity, data?: Partial<SerializedSkill>) {
    this.unserialize({
      id: this.id,
      level: this.level,
      ...data,
    })
  }

  get engine(): Engine {
    return this.entity.engine
  }

  get template(): SkillTempalte {
    return templateMap[this.id] ?? Skill$Base
  }

  onUse(combat: CombatSystem) {
    this.template.onUse(this, combat)
  }

  serialize(): SerializedSkill {
    return _.pick(this, 'id', 'level')
  }

  unserialize(data: SerializedSkill) {
    this.id = data.id
    this.level = data.level
  }
}

export interface SerializedSkill {
  id: number
  level: number
}

export interface SkillTempalte {
  id: number
  name: string
  onUse(instance: Skill, combat: CombatSystem): boolean
}

export const Skill$Base: SkillTempalte = {
  id: -1,
  name: 'UnnamedSkill',
  onUse() {
    return false
  },
}

export const Skill$Thump: SkillTempalte = {
  id: 1,
  name: '重击',
  onUse(instance, combat) {
    const source = instance.entity
    const target = combat.getFirstEnemy(instance.entity)
    if (!target) return false

    const damage = source.atk.value * 2
    combat.msgs.push(
      `${source.name} 对 ${target.name} 释放了 ${this.name}，造成 ${damage} 伤害，剩余 hp ${target.currentHP}`,
    )
    target.currentHP -= damage
    return true
  },
}

export const templates: SkillTempalte[] = [Skill$Thump]
export const templateMap: Partial<
  Record<SkillTempalte['id'], SkillTempalte>
> = templates.reduce((map, template) => {
  map[template.id] = template
  return map
}, {})
