import _, { uniqueId } from 'lodash'
import { BooleanT } from '../utils'
import { DataManager } from './DataManager'

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
    src: DataSource,
    data: Omit<Item.Serialized, 'id'>,
  ): Item {
    const item = new Item()
    item.id = uniqueId('item')
    item.name = data.name
    src.items.add(item)
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

export class Entity {
  id: string = ''
  name: string = ''

  items: Item[] = []

  attrPoint: number = 0
  strength: number = 0
  constitution: number = 0

  hp: number = 0
  maxHP: number = 0

  serialize(): Entity.Serialized {
    return {
      ..._.pick(
        this,
        'id',
        'name',
        'attrPoint',
        'strength',
        'constitution',
        'hp',
        'maxHP',
      ),
      items: this.items.map((item) => item.id),
    }
  }

  static unserialize(data: Entity.Serialized, src: DataSource): Entity {
    const entity = new Entity()
    Object.assign(
      entity,
      _.pick(
        data,
        'id',
        'name',
        'attrPoint',
        'strength',
        'constitution',
        'hp',
        'maxHP',
      ),
    )
    entity.items = data.items.map((id) => src.items.get(id)).filter(BooleanT())
    return entity
  }
}

export namespace Entity {
  export interface Serialized {
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

  export function create(
    src: DataSource,
    data: Pick<Entity.Serialized, 'name'>,
  ): Entity {
    const entity = new Entity()
    entity.id = uniqueId('entity')
    entity.name = data.name
    src.entities.add(entity)
    return entity
  }
}

export interface DataSource {
  entities: DataManager<Entity, Entity.Serialized>
  items: DataManager<Item, Item.Serialized>
  skills: DataManager<Skill, Skill.Serialized>
}
