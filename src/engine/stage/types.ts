import _, { uniqueId } from 'lodash'
import { StageStore } from './store'
import { actionCreators as entityActionCreators } from './store/packs/entity/actions'
import { actionCreators as itemActionCreators } from './store/packs/item/actions'

export interface Item {
  id: string
  name: string
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
}

export interface Stage {
  store: StageStore
}
