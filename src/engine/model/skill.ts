import _ from 'lodash'
import { Engine } from '..'
import { CombatSystem } from '../combat'
import { BattlingEntity, Entity } from './entity'

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

  onUse(combat: CombatSystem): boolean {
    return this.template.onUse?.(this, combat) ?? false
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
  onUse?(instance: Skill, combat: CombatSystem): boolean
}

export const Skill$Base: SkillTempalte = {
  id: -1,
  name: 'UnnamedSkill',
}

/** N 倍伤害的单体攻击 */
export const Skill$Thump: SkillTempalte = {
  id: 1,
  name: '重击',
  onUse(instance, combat) {
    const source = instance.entity
    const target = combat.getFirstAliveEnemy(source)
    if (!target) return false

    const damage = source.atk.value * 2
    target.currentHP -= damage
    combat.msgs.push(
      `${source.name} 对 ${target.name} 释放了 ${this.name}，造成 ${damage} 伤害，剩余 hp ${target.currentHP}`,
    )
    return true
  },
}

/** 百分比回血 */
export const Skill$Recovery: SkillTempalte = {
  id: 2,
  name: '回春',
  onUse(instance, combat) {
    const source = instance.entity
    if (!(source instanceof BattlingEntity)) return false

    const damaged = source.maxHP.value - source.currentHP
    if (damaged === 0) return false

    const count = Math.round(source.maxHP.value * 0.1)
    source.currentHP += Math.min(damaged, count)
    combat.msgs.push(
      `${source.name} 释放了 ${this.name}，回复 ${count} hp，当前 hp ${source.currentHP}`,
    )
    return true
  },
}

/** N 倍伤害的群体攻击 */
export const Skill$Spikeweed: SkillTempalte = {
  id: 3,
  name: '地刺',
  onUse(instance, combat) {
    const source = instance.entity
    const targets = combat.getAliveEnemies(source)

    const damage = source.atk.value * 2
    targets.forEach((target) => {
      target.currentHP -= damage
    })
    combat.msgs.push(
      `${source.name} 释放了 ${this.name}，对 ${targets
        .map((t) => t.name)
        .join('、')} 造成 ${damage} 伤害`,
    )

    return true
  },
}

/** 随机复活一个死亡的队友 */
export const Skill$Revive: SkillTempalte = {
  id: 4,
  name: '复苏',
  onUse(instance, combat) {
    const source = instance.entity
    const target = _.sample(
      combat.getTeammates(instance.entity).filter(Entity.isDead),
    )
    if (!target) return false

    target.currentHP = Math.round(target.maxHP.value / 2)
    combat.msgs.push(
      `${source.name} 对 ${target.name} 释放了 ${this.name}，${target.name} 剩余 hp ${target.currentHP}`,
    )

    return true
  },
}

/** 施加灼伤效果，每回合扣血，持续 3 回合 */
export const Skill$Ignition: SkillTempalte = {
  id: 5,
  name: '引燃',
  onUse(instance, combat) {
    const source = instance.entity
    const target = _.sample(
      combat.getTeammates(instance.entity).filter(Entity.isDead),
    )
    if (!target) return false

    target.currentHP = Math.round(target.maxHP.value / 2)
    combat.msgs.push(
      `${source.name} 对 ${target.name} 释放了 ${this.name}，${target.name} 剩余 hp ${target.currentHP}`,
    )

    return true
  },
}

export const templates: SkillTempalte[] = [
  Skill$Thump,
  Skill$Recovery,
  Skill$Spikeweed,
  Skill$Revive,
]
export const templateMap: Partial<
  Record<SkillTempalte['id'], SkillTempalte>
> = templates.reduce((map, template) => {
  map[template.id] = template
  return map
}, {})
