import { Stage } from '../../stage'
import { UniqueId } from '../../types'
import { createUniqueId } from '../../utils'
import { Equip } from '../item'
import { Skill } from '../skill'
import {
  AttrDescriptor,
  AttrDescriptor$Attack,
  AttrDescriptor$HealthPoint,
} from './AttrDescriptor'

export class Entity {
  id: UniqueId = createUniqueId()
  name: string = 'UnnamedEntity'

  /** 基础属性 */

  strength = new AttrDescriptor(this)
  constitution = new AttrDescriptor(this)
  // 影响行动进度的增加速度
  speed = new AttrDescriptor(this)

  /** 衍生属性 */
  maxHP = new AttrDescriptor$HealthPoint(this)
  atk = new AttrDescriptor$Attack(this)

  currentHP: number = 0

  _equipIds: Equip['id'][] = []
  get equipIds() {
    return this._equipIds
  }

  skills: Skill[] = []

  constructor(public stage: Stage, data?: Partial<Entity.Serialized>) {
    this.deserialize({
      ...this.serialize(),
      ...data,
    })
  }

  serialize(): Entity.Serialized {
    return {
      id: this.id,
      name: this.name,
      strength: this.strength.base,
      constitution: this.constitution.base,
      speed: this.speed.base,
      maxHP: this.maxHP.base,
      atk: this.atk.base,
      equipIds: this._equipIds,
      skills: this.skills.map((skill) => skill.serialize()),
    }
  }

  deserialize(data: Entity.Serialized): void {
    this.id = data.id
    this.name = data.name
    this.strength.base = data.strength
    this.constitution.base = data.constitution
    this.speed.base = data.speed
    this.maxHP.base = data.maxHP
    this.atk.base = data.atk
    this._equipIds = []
    this.skills = data.skills.map((skillData) =>
      Skill.deserialize(skillData, this, this.stage)
    )
  }

  static deserialize(data: Entity.Serialized, stage: Stage): Entity {
    const entity = new Entity(stage)
    entity.deserialize(data)
    return entity
  }

  get isAlive() {
    return this.currentHP > 0
  }
}

export namespace Entity {
  export interface Serialized {
    id: UniqueId
    name: string
    strength: number
    constitution: number
    speed: number
    maxHP: number
    atk: number
    equipIds: Equip['id'][]
    skills: Skill.Serialized[]
  }
}
