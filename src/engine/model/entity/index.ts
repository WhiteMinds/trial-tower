import { Stage } from '../../stage'
import { UniqueId } from '../../types'
import { createUniqueId } from '../../utils'
import { Buff } from '../buff'
import { Equip, Item } from '../item'
import { Skill } from '../skill'
import {
  AttrDescriptor,
  AttrDescriptor$Attack,
  AttrDescriptor$HealthPoint,
} from './AttrDescriptor'

export class Entity {
  id: UniqueId = createUniqueId()
  name: string = 'UnnamedEntity'

  level: number = 1
  exp: number = 0

  /** 基础属性 */

  strength = new AttrDescriptor(this)
  constitution = new AttrDescriptor(this)
  // 影响行动进度的增加速度
  speed = new AttrDescriptor(this)

  /** 衍生属性 */
  maxHP = new AttrDescriptor$HealthPoint(this)
  atk = new AttrDescriptor$Attack(this)

  currentHP: number = 0

  private _equips: Equip[] = []
  get equips(): Equip[] {
    return this._equips.slice(0)
  }

  // 外界系统应该通过实例上的 api 来改变这个属性，不能直接操作。
  // 缺点是 getSkills 获取的是 skills 快照，而不是一个动态变化的数组，或许应该叫 getCurrentSkills？
  private _skills: Skill[] = []
  getSkills(): Skill[] {
    return this._skills.slice(0)
  }

  private _buffs: Buff[] = []
  getBuffs(): Buff[] {
    return this._buffs.slice(0)
  }

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
      equipIds: this.equips.map(({ id }) => id),
      skills: this.getSkills().map((skill) => skill.serialize()),
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

    this._equips = []
    data.equipIds
      .map((id) => this.stage.getItem(id))
      .filter((item): item is Equip => item instanceof Equip)
      .forEach((equip) => this.equip(equip))

    this._skills = []
    data.skills.forEach((skillData) =>
      this.addSkill(Skill.deserialize(skillData, this.stage))
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

  addSkill(skill: Skill): void {
    this._skills.push(skill)
    skill.onCasted(this)
  }

  grantBuff(buff: Buff): void {
    // TODO: 这里要检查 target 上是否已经有 buff 了
    // 如果没有就直接施加并触发一些生命周期
    // 如果有，应该触发 existedBuff.mixing(buff)，在其内部决定叠加的规则，
    // 如果不可叠加则返回 false，如果具有唯一性则什么也不做就返回 true。
    // 在返回 false 时添加一个同类型的 buff 到 target 上。
    // 如果有多个，则按顺序调用，直到其中一个返回 true 时终止
    const existedBuffs = this.getBuffs().filter(
      // TODO: 这个判断可能会出问题，因为可能有 buff 继承自另一个 buff 实现
      (existedBuff) => existedBuff instanceof buff.constructor
    )
    const mixed = existedBuffs.find((existedBuff) => existedBuff.mixing(buff))
    if (mixed) return

    this._buffs.push(buff)
    buff.onCasted()
  }

  equip(item: Equip): void {
    this._equips.push(item)
    // 这个生命周期应该在 addItem 时调用，不过目前先在这里实现
    item.onCasted(this)
    item.onEquip()
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
