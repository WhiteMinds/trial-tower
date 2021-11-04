import EventEmitter from 'eventemitter3'
import _, { uniqueId } from 'lodash'
import { Entity } from '../model/entity'
import { ObjectManager } from './ObjectManager'

export class Item {
  id: string = ''
  name: string = ''
  // ... other attrs ...

  serialize(): Item.Serialized {
    return _.pick(this, 'id', 'name')
  }

  static unserialize(data: Item.Serialized): Item {
    const item = new Item()
    item.id = data.id
    item.name = data.name
    return item
  }
}

export namespace Item {
  export interface Serialized {
    id: string
    name: string
  }

  export function create(
    stage: Stage,
    data: Omit<Item.Serialized, 'id'>,
  ): Item {
    const item = new Item()
    item.id = uniqueId('item')
    item.name = data.name
    stage.items.add(item)
    return item
  }
}

export class Skill {
  id: string = ''
  name: string = ''
  // ... other attrs ...

  serialize(): Skill.Serialized {
    return _.pick(this, 'id', 'name')
  }

  static unserialize(data: Skill.Serialized): Skill {
    const skill = new Skill()
    skill.id = data.id
    skill.name = data.name
    return skill
  }
}

export namespace Skill {
  export interface Serialized {
    id: string
    name: string
  }
}

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

// export namespace Entity {
//   export interface Serialized {
//     id: string
//     name: string

//     items: Item['id'][]

//     // test attrs
//     attrPoint: number
//     strength: number
//     constitution: number

//     hp: number
//     maxHP: number
//   }

//   export function create(
//     stage: Stage,
//     data: Pick<Entity.Serialized, 'name'>,
//   ): Entity {
//     const entity = new Entity(stage)
//     entity.id = uniqueId('entity')
//     entity.name = data.name
//     stage.entities.add(entity)
//     stage.emit('EntityCreated', entity)
//     return entity
//   }
// }

export type StageEventTypes = {
  EntityCreated: [Entity]
  ItemCreated: [Item]
}

export interface Stage extends EventEmitter<StageEventTypes> {
  entities: ObjectManager<Entity, Entity.Serialized>
  items: ObjectManager<Item, Item.Serialized>
  skills: ObjectManager<Skill, Skill.Serialized>
}
