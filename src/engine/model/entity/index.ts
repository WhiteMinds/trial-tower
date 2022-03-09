import { remove } from 'lodash-es'
import { Stage } from '../../stage'
import { UniqueId } from '../../types'
import { BooleanT, createUniqueId } from '../../utils'
import { Buff } from '../buff'
import { Equip, Item } from '../item'
import { Skill, SkillTemplateMap } from '../skill'
import { SkillTemplateId } from '../skill/SkillTemplateId'
import {
  AttrDescriptor,
  AttrDescriptor$Attack,
  AttrDescriptor$HealthPoint,
} from './AttrDescriptor'

export interface SkillModifier {
  skillTemplateId: SkillTemplateId
  upgradeLevel: number
}

export class Entity {
  id: UniqueId = createUniqueId()
  name: string = 'UnnamedEntity'

  level: number = 1
  // TODO: 经验值和金币看起来是 player 独有的属性，可能应该单独实现一个类，不过有些成本暂时不搞
  exp: number = 0
  gold: number = 0

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

  // player inventory
  private _items: Item[] = []
  get items(): Item[] {
    return this._items.slice(0)
  }

  // 外界系统应该通过实例上的 api 来改变这个属性，不能直接操作。
  // 缺点是 getSkills 获取的是 skills 快照，而不是一个动态变化的数组，或许应该叫 getCurrentSkills？
  private _skills: Skill[] = []
  getSkills(): Skill[] {
    return this._skills.slice(0)
  }

  skillModifiers: SkillModifier[] = []
  addSkillModifier(skillModifier: SkillModifier): void {
    const existedSkill = this.getSkills().find(
      ({ templateId }) => templateId === skillModifier.skillTemplateId
    )
    if (existedSkill == null) {
      const skill = new SkillTemplateMap[skillModifier.skillTemplateId](
        this.stage
      )
      skill.level = skillModifier.upgradeLevel
      this.addSkill(skill)
      return
    }

    existedSkill.level += skillModifier.upgradeLevel
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

  createSnapshot(): Entity.Snapshot {
    return {
      snapshotType: 'Entity',
      id: this.id,
      name: this.name,
      level: this.level,
      exp: this.exp,
      strength: this.strength.value,
      constitution: this.constitution.value,
      speed: this.speed.value,
      maxHP: this.maxHP.value,
      atk: this.atk.value,
      currentHP: this.currentHP,
      items: this.items.map((i) => i.createSnapshot()),
      equips: this.equips.map((e) => e.createSnapshot()),
      skills: this.getSkills().map((s) => s.createSnapshot()),
      buffs: this.getBuffs().map((b) => b.createSnapshot()),
    }
  }

  serialize(): Entity.Serialized {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      exp: this.exp,
      strength: this.strength.base,
      constitution: this.constitution.base,
      speed: this.speed.base,
      maxHP: this.maxHP.base,
      atk: this.atk.base,
      itemIds: this.items.map(({ id }) => id),
      equipIds: this.equips.map(({ id }) => id),
      skills: this.getSkills().map((skill) => skill.serialize()),
    }
  }

  deserialize(data: Entity.Serialized): void {
    this.id = data.id
    this.name = data.name
    this.level = data.level
    this.exp = data.exp
    this.strength.base = data.strength
    this.constitution.base = data.constitution
    this.speed.base = data.speed
    this.maxHP.base = data.maxHP
    this.atk.base = data.atk

    this._items = []
    data.itemIds
      .map((id) => this.stage.getItem(id))
      .filter(BooleanT())
      .forEach((item) => this.addItem(item))

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

  addExp(amount: number): void {
    this.exp += amount
    // TODO: 升级曲线之后再做，先固定一个数字
    const nextLevelNeed = 100
    while (this.exp >= nextLevelNeed) {
      this.exp -= nextLevelNeed
      this.level++
      // TODO: 调用生命周期 onLevelUp 之类的
      console.log(`[${this.name}] 升级至 LV.${this.level}`)
    }
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

  withdrawBuff(buff: Buff): void {
    remove(this._buffs, buff)
  }

  addItem(item: Item): void {
    this._items.push(item)
  }

  removeItem(item: Item): void {
    remove(this._items, item)
  }

  equip(item: Equip): void {
    this.removeItem(item)
    this._equips.push(item)
    // 这个生命周期应该在 addItem 时调用，不过目前先在这里实现
    item.onCasted(this)
    item.onEquip()
  }
}

export namespace Entity {
  // Snapshot 与 Serialized 的主要区别是：
  // Snapshot 具有更多的数据，本身可以表达出一个较完整的信息，主要用于信息传递，比如服务端
  // 传达给客户端，不要求数据可逆的。
  // 而 Serialized 主要是负责持久化存储，会将一些数据拆分开存储，以及一些运行时才存在的数据
  // 会直接丢弃（比如 buff），所以它本身不一定能完整表达数据，但要求其数据是可结合其他数据逆向转回实例的。
  export interface Serialized {
    id: UniqueId
    name: string
    level: number
    exp: number
    strength: number
    constitution: number
    speed: number
    maxHP: number
    atk: number
    itemIds: Item['id'][]
    equipIds: Equip['id'][]
    skills: Skill.Serialized[]
  }

  export interface Snapshot {
    snapshotType: 'Entity'
    id: UniqueId
    name: string
    level: number
    exp: number
    strength: number
    constitution: number
    speed: number
    maxHP: number
    atk: number
    currentHP: number
    items: Item.Snapshot[]
    equips: Equip.Snapshot[]
    skills: Skill.Snapshot[]
    buffs: Buff.Snapshot[]
  }
}
