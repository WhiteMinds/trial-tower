import { Equip } from './equip'

// 如果 hp 的计算受体质属性影响，那在体质变化后，currentHp 怎样更新
// 可以在任意属性的 base / modifiers 发生变化后进行通知，currentHp 有一个专门的处理函数来做立即更新

export interface Entity {
  id: number
  name: string
  
  // 基础属性
  strength: AttrDescriptor
  constitution: AttrDescriptor
  // 影响行动进度的增加速度
  speed: AttrDescriptor

  // 衍生属性
  maxHP: AttrDescriptor$HealthPoint
  atk: AttrDescriptor$Attack

  equips: Equip['id'][]
}

export interface BattlingEntity extends Entity {
  progress: number
  currentHP: number
}

export enum AttrType {
  Normal,
  HealthPoint,
  Attack,
}

export interface AttrDescriptor {
  type: AttrType
  base: number
  modifiers: AttrModifier[]
}

export interface AttrDescriptor$Normal extends AttrDescriptor {
  type: AttrType.Normal
}

export interface AttrDescriptor$HealthPoint extends AttrDescriptor {
  type: AttrType.HealthPoint
}

export interface AttrDescriptor$Attack extends AttrDescriptor {
  type: AttrType.Attack
}

export type AttrModifier =
  | {
      fixed: number
    }
  | {
      add?: number
      per?: number
    }

export namespace AttrDescriptor {
  export function getValue(entity: Entity, descriptor: AttrDescriptor): number {
    let derived = AttrDescriptor.getDerived(entity, descriptor)
    if (descriptor.modifiers.length === 0) return derived

    const modifier = descriptor.modifiers.reduce((result, modifier) => {
      if ('fixed' in modifier) return modifier
      if ('fixed' in result) return result
      return {
        add: (result.add ?? 0) + (modifier.add ?? 0),
        per: (result.per ?? 0) + (modifier.per ?? 0),
      }
    })
    if ('fixed' in modifier) return modifier.fixed

    return (derived + modifier.add!) * (1 + modifier.per!)
  }

  export function getDerived(entity: Entity,descriptor: AttrDescriptor): number {
    switch(descriptor.type) {
      case AttrType.HealthPoint:
        return descriptor.base + AttrDescriptor.getValue(entity, entity.constitution) * 5
      case AttrType.Attack:
        return descriptor.base + Math.floor(AttrDescriptor.getValue(entity, entity.strength) / 2)
      case AttrType.Normal:
        return descriptor.base
    }
  }
}

export namespace Entity {
  export function isAlive(entity: Entity) {
    return AttrDescriptor.getValue(entity, entity.maxHP) > 0
  }
}
