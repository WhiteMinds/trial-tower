import { uniqueId } from 'lodash'
import { BehaviorSubject } from 'rxjs'
import { Engine } from '..'
import { UniqueId } from '../types'
import { Equip } from './equip'
import { SerializedSkill, Skill } from './skill'

// 如果 hp 的计算受体质属性影响，那在体质变化后，currentHp 怎样更新
// 可以在任意属性的 base / modifiers 发生变化后进行通知，currentHp 有一个专门的处理函数来做立即更新
// 比如 desc.modifiers 可以是个 subject？

export class Entity {
  id: UniqueId = uniqueId('entity')
  name: string = 'UnamedEntity'

  /** 基础属性 */

  strength = new AttrDescriptor(this)
  constitution = new AttrDescriptor(this)
  // 影响行动进度的增加速度
  speed = new AttrDescriptor(this)

  /** 衍生属性 */
  maxHP = new AttrDescriptor$HealthPoint(this)
  atk = new AttrDescriptor$Attack(this)

  /** 非游戏引擎原始依赖的属性（如 EquipModeul 添加的 equipIds）*/

  equipIds = new BehaviorSubject<Equip['id'][]>([])
  skills = new BehaviorSubject<Skill[]>([])

  constructor(public engine: Engine, data?: Partial<SerializedEntity>) {
    this.unserialize({
      name: 'UnamedEntity',
      strength: 1,
      constitution: 1,
      speed: 1,
      maxHP: 1,
      atk: 1,
      equipIds: [],
      skills: [],
      ...data,
    })

    // 通知初始化
    engine.entitySubjects.init.next(this)
  }

  serialize(): SerializedEntity {
    return {
      name: this.name,
      strength: this.strength.base,
      constitution: this.constitution.base,
      speed: this.speed.base,
      maxHP: this.maxHP.base,
      atk: this.atk.base,
      equipIds: this.equipIds.value,
      skills: this.skills.value.map((skill) => skill.serialize()),
    }
  }

  unserialize(data: SerializedEntity) {
    this.name = data.name
    this.strength.base = data.strength
    this.constitution.base = data.constitution
    this.speed.base = data.speed
    this.maxHP.base = data.maxHP
    this.atk.base = data.atk
    this.equipIds.next([...data.equipIds])
    this.skills.next(data.skills.map((skillData) => new Skill(this, skillData)))
  }

  clone(engine = this.engine) {
    return new Entity(engine, this.serialize())
  }
}

export interface SerializedEntity {
  name: string
  strength: number
  constitution: number
  speed: number
  maxHP: number
  atk: number
  equipIds: Equip['id'][]
  skills: Partial<SerializedSkill>[]
}

export class BattlingEntity extends Entity {
  progress: number = 0
  currentHP: number = 0

  static from(entity: Entity): BattlingEntity {
    const battlingEntity = new BattlingEntity(entity.engine, entity.serialize())
    battlingEntity.currentHP = battlingEntity.maxHP.value
    return battlingEntity
  }
}

export class AttrDescriptor {
  constructor(public entity: Entity) {}

  // 基础值
  base = 0

  // 衍生值，由（基础值 + 某些属性经过公式计算后的值）所衍生出的结果
  get derived() {
    return this.base
  }

  // 属性修饰器
  modifiers: AttrModifier[] = []

  // 最终值，将所有修饰器应用于衍生值后得出的结果
  get value() {
    return AttrDescriptor.getValue(this)
  }
}

export class AttrDescriptor$HealthPoint extends AttrDescriptor {
  get derived() {
    return this.base + this.entity.constitution.value * 5
  }
}

export class AttrDescriptor$Attack extends AttrDescriptor {
  get derived() {
    return this.base + Math.floor(this.entity.strength.value / 2)
  }
}

export type AttrModifier = { source?: UniqueId } & (
  | {
      fixed: number
    }
  | {
      add?: number
      per?: number
    }
)

export namespace AttrDescriptor {
  export function getValue(descriptor: AttrDescriptor): number {
    if (descriptor.modifiers.length === 0) return descriptor.derived

    const modifier = combineAttrModifier(descriptor.modifiers)
    if ('fixed' in modifier) return modifier.fixed

    const add = modifier.add ?? 0
    const per = 1 + (modifier.per ?? 0)
    return (descriptor.derived + add) * per
  }
}

function combineAttrModifier(modifiers: AttrModifier[]): AttrModifier {
  return modifiers.reduce((result, modifier) => {
    // 固定值的优先级最高
    if ('fixed' in modifier) return modifier
    if ('fixed' in result) return result

    return {
      add: (result.add ?? 0) + (modifier.add ?? 0),
      per: (result.per ?? 0) + (modifier.per ?? 0),
    }
  })
}

export namespace Entity {
  export function isAlive(entity: BattlingEntity) {
    return entity.currentHP > 0
  }
}
