import _, { uniqueId } from 'lodash'
import { BooleanT } from '../utils'
import { StageStore } from './store'
import { actionCreators as entityActionCreators } from './store/packs/entity/actions'
import { actionCreators as itemActionCreators } from './store/packs/item/actions'

export interface Item {
  id: string
  name: string
  maxHP?: AttrModifier
}

export namespace Item {
  export function create(stage: Stage, data: Partial<Omit<Item, 'id'>>): Item {
    const item = {
      id: uniqueId('item'),
      name: 'Item',
      ...data,
    }
    stage.store.dispatch(itemActionCreators.createItem(item))
    return item
  }

  export type DataView = Item

  export function getDataView(item: Item): DataView {
    return item
  }
}

// export class Skill {
//   id: string = ''
//   name: string = ''
//   // ... other attrs ...

//   serialize(): Skill.Serialized {
//     return _.pick(this, 'id', 'name')
//   }

//   static unserialize(data: Skill.Serialized): Skill {
//     const skill = new Skill()
//     skill.id = data.id
//     skill.name = data.name
//     return skill
//   }
// }

// export namespace Skill {
//   export interface Serialized {
//     id: string
//     name: string
//   }
// }

// export class Entity {
//   id: string = ''
//   name: string = ''

//   items: Item[] = []

//   attrPoint: number = 0
//   strength: number = 0
//   constitution: number = 0

//   hp: number = 0
//   maxHP: number = 0

//   constructor(public stage: Stage, data?: Partial<Entity.Serialized>) {
//     // this.unserialize(
//     //   {
//     //     id: '0',
//     //     name: 'UnamedEntity',
//     //     strength: 1,
//     //     constitution: 1,
//     //     maxHP: 1,
//     //     ...data,
//     //   },
//     //   stage,
//     // )
//     // 通知初始化
//     // stage.emit('entity init')
//   }

//   serialize(): Entity.Serialized {
//     return {
//       ..._.pick(
//         this,
//         'id',
//         'name',
//         'attrPoint',
//         'strength',
//         'constitution',
//         'hp',
//         'maxHP',
//       ),
//       items: this.items.map((item) => item.id),
//     }
//   }

//   unserialize(data: Entity.Serialized) {
//     Object.assign(
//       this,
//       _.pick(
//         data,
//         'id',
//         'name',
//         'attrPoint',
//         'strength',
//         'constitution',
//         'hp',
//         'maxHP',
//       ),
//     )
//     this.items = data.items
//       .map((id) => this.stage.items.get(id))
//       .filter(BooleanT())
//   }

//   static unserialize(data: Entity.Serialized, stage: Stage): Entity {
//     const entity = new Entity(stage)
//     entity.unserialize(data)
//     return entity
//   }
// }

export interface Entity {
  id: string
  name: string

  equips: Item['id'][]
  items: Item['id'][]

  // test attrs
  attrPoint: number
  strength: number
  constitution: number

  hp: number
  maxHP: number
}

export namespace Entity {
  export function create(
    stage: Stage,
    data: Partial<Omit<Entity, 'id'>>,
  ): Entity {
    const entity: Entity = {
      id: uniqueId('entity'),
      name: 'Entity',
      equips: [],
      items: [],
      attrPoint: 0,
      strength: 1,
      constitution: 1,
      hp: 10,
      maxHP: 10,
      ...data,
    }
    stage.store.dispatch(entityActionCreators.createEntity(entity))
    return entity
  }

  export interface DataView extends Pick<Entity, 'id' | 'name' | 'hp'> {
    strengthDesc: AttrDescriptor$Normal
    strength: number
    constitutionDesc: AttrDescriptor$Normal
    constitution: number
    maxHPDesc: AttrDescriptor$HealthPoint
    maxHP: number
    equips: Item.DataView[]
    items: Item.DataView[]
  }

  export function getDataView(entity: Entity, stage: Stage): DataView {
    // 计算装备、技能等加成后的实际数值

    const equips = entity.equips
      .map((id) => stage.getItem(id))
      .filter(BooleanT())
    const items = entity.items.map((id) => stage.getItem(id)).filter(BooleanT())

    const strengthDesc: AttrDescriptor$Normal = {
      type: AttrType.Normal,
      base: entity.constitution,
      modifiers: [],
    }
    const strength = AttrDescriptor.calcValue(strengthDesc, {})

    const constitutionDesc: AttrDescriptor$Normal = {
      type: AttrType.Normal,
      base: entity.constitution,
      modifiers: [],
    }
    const constitution = AttrDescriptor.calcValue(constitutionDesc, {})

    const maxHPDesc: AttrDescriptor$HealthPoint = {
      type: AttrType.HealthPoint,
      base: entity.hp,
      modifiers: equips.map((item) => item.maxHP).filter(BooleanT()),
    }
    const maxHP = AttrDescriptor.calcValue(maxHPDesc, { constitution })

    const view: DataView = {
      ..._.pick(entity, 'id', 'name', 'hp'),
      strengthDesc,
      strength,
      constitutionDesc,
      constitution,
      maxHPDesc,
      maxHP,
      equips,
      items,
    }

    return view
  }
}

export interface Stage {
  store: StageStore
  getItem(id: Item['id']): Item | null
}

// =============== AttrDescriptor ===============

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

export type AttrModifier = { source?: Item['id'] } & (
  | {
      fixed: number
    }
  | {
      add?: number
      per?: number
    }
)

interface AttrDescriptorCalcOptsMap extends Record<AttrType, {}> {
  [AttrType.Normal]: {}
  [AttrType.HealthPoint]: { constitution: number }
  [AttrType.Attack]: { strength: number }
}
type AttrDescriptorCalcOpts = Partial<
  UnionToIntersection<AttrDescriptorCalcOptsMap[AttrType]>
>
// export function calcValue<T extends keyof AttrDescriptorCalcOptsMap>(entity: Entity, descriptor: Omit<AttrDescriptor, 'type'> & { type: T }, opts: AttrDescriptorCalcOptsMap[T]): number

export namespace AttrDescriptor {
  export function calcValue<T extends keyof AttrDescriptorCalcOptsMap>(
    descriptor: AttrDescriptor & { type: T },
    opts: AttrDescriptorCalcOptsMap[T],
  ): number {
    let derived = getDerived(descriptor, opts)
    if (descriptor.modifiers.length === 0) return derived

    const modifier = descriptor.modifiers.reduce(
      (result, modifier) => {
        if ('fixed' in modifier) return modifier
        if ('fixed' in result) return result
        return {
          add: (result.add ?? 0) + (modifier.add ?? 0),
          per: (result.per ?? 0) + (modifier.per ?? 0),
        }
      },
      { add: 0, per: 0 },
    )
    if ('fixed' in modifier) return modifier.fixed

    return (derived + modifier.add!) * (1 + modifier.per!)
  }

  function getDerived(
    descriptor: AttrDescriptor,
    // TODO: 这里的类型推断不太好做，所以先直接写了个 opts 的集合用着
    opts: AttrDescriptorCalcOpts,
  ): number {
    switch (descriptor.type) {
      case AttrType.HealthPoint:
        if (opts.constitution == null) throw new Error('Unexpected data')
        return descriptor.base + opts.constitution! * 5
      case AttrType.Attack:
        if (opts.strength == null) throw new Error('Unexpected data')
        return descriptor.base + Math.floor(opts.strength / 2)
      case AttrType.Normal:
        return descriptor.base
    }
  }
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never
