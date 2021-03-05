import { uniqueId } from 'lodash'
import { UniqueId } from '../types'
import { Equip } from './equip'

// 如果 hp 的计算受体质属性影响，那在体质变化后，currentHp 怎样更新
// 可以在任意属性的 base / modifiers 发生变化后进行通知，currentHp 有一个专门的处理函数来做立即更新

export class Entity {
  id: UniqueId = uniqueId('entity')
  name: string = 'UnamedEntity'

  // 基础属性
  strength = new AttrDescriptor(this)
  constitution = new AttrDescriptor(this)
  // 影响行动进度的增加速度
  speed = new AttrDescriptor(this)

  // 衍生属性
  maxHP = new AttrDescriptor$HealthPoint(this)
  atk = new AttrDescriptor$Attack(this)

  equipIds: Equip['id'][] = []

  serialize(): SerializedEntity {
    return {
      name: this.name,
      strength: this.strength.base,
      constitution: this.constitution.base,
      speed: this.speed.base,
      maxHP: this.maxHP.base,
      atk: this.atk.base,
      equipIds: this.equipIds,
    }
  }

  static unserialize(data: SerializedEntity): Entity {
    return this.unserializeToInstance(data, new Entity())
  }

  static unserializeToInstance<T extends Entity = Entity>(
    data: SerializedEntity,
    entity: T,
  ): T {
    entity.name = data.name
    entity.strength.base = data.strength
    entity.constitution.base = data.constitution
    entity.speed.base = data.speed
    entity.maxHP.base = data.maxHP
    entity.atk.base = data.atk
    return entity
  }

  static create(data: Partial<SerializedEntity>) {
    return this.unserialize({
      name: 'UnamedEntity',
      strength: 1,
      constitution: 1,
      speed: 1,
      maxHP: 1,
      atk: 1,
      equipIds: [],
      ...data,
    })
  }

  clone() {
    return Entity.unserialize(this.serialize())
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
}

export class BattlingEntity extends Entity {
  progress: number = 0
  currentHP: number = 0

  static from(entity: Entity): BattlingEntity {
    const battlingEntity = Entity.unserializeToInstance(
      entity.serialize(),
      new BattlingEntity(),
    )
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

    const modifier = descriptor.modifiers.reduce((result, modifier) => {
      if ('fixed' in modifier) return modifier
      if ('fixed' in result) return result
      return {
        add: (result.add ?? 0) + (modifier.add ?? 0),
        per: (result.per ?? 0) + (modifier.per ?? 0),
      }
    })
    if ('fixed' in modifier) return modifier.fixed

    return (descriptor.derived + modifier.add!) * (1 + modifier.per!)
  }
}

export namespace Entity {
  export function isAlive(entity: BattlingEntity) {
    return entity.currentHP > 0
  }
}
