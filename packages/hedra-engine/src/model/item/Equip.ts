import R from 'ramda'
import { Item } from '.'
import { Entity, SkillModifier } from '../entity'
import { AttrModifier } from '../entity/AttrDescriptor'
import { SkillTemplateMap } from '../skill'
import { SkillTemplateId } from '../skill/SkillTemplateId'

interface EquipRequired {
  level?: number
  str?: number
  con?: number
}

export enum EquipSlot {
  // 主手
  MainHead,
  // 副手
  OffHead,
  // 头部
  Head,
  // 身体
  Body,
  // 足部
  Foot,
  // 项链
  Amulet,
}

// 相对于 Item，它特别的地方在于它的 use 固定为调度 player 的 equip，并且有一些特殊的生命周期
export class Equip extends Item {
  get slot(): EquipSlot {
    return EquipSlot.MainHead
  }
  get name(): string {
    return 'BaseEquip'
  }
  get description() {
    // TODO: 这些需求、属性到时候要放到视图层里做，这里应该只是放对于装备的介绍之类的
    return [...getRequiredTexts(this.required), '', ...getAttrBonusTexts(this), ...getSkillBonusTexts(this)].join('\n')
  }

  readonly canStacked = false

  get required(): EquipRequired {
    return {}
  }

  strModifier?: AttrModifier
  conModifier?: AttrModifier
  speedModifier?: AttrModifier
  maxHPModifier?: AttrModifier
  atkModifier?: AttrModifier

  skillModifiers: SkillModifier[] = []

  createSnapshot(): Equip.Snapshot {
    return {
      ...super.createSnapshot(),
      isEquip: true,
      required: this.required,

      // TODO: 这些可能是可变数据，看看之后要不要处理下
      strModifier: this.strModifier,
      conModifier: this.conModifier,
      speedModifier: this.speedModifier,
      maxHPModifier: this.maxHPModifier,
      atkModifier: this.atkModifier,
      skillModifiers: this.skillModifiers,
    }
  }

  canUse(): boolean {
    this.assertOwner()

    if (this.required.level != null && this.required.level > this.owner.level) {
      return false
    }

    if (this.required.str != null && this.required.str > this.owner.strength.value) {
      return false
    }

    if (this.required.con != null && this.required.con > this.owner.constitution.value) {
      return false
    }

    return true
  }

  async use(): Promise<boolean> {
    this.assertOwner()
    // TODO: 这里需要重复调用 equip 的检查，或者放到 player 中实现
    this.owner.equip(this)
    return true
  }

  onEquip(entity: Entity): void {
    this.owner = entity

    this.strModifier && this.owner.strength.modifiers.push(this.strModifier)
    this.conModifier && this.owner.constitution.modifiers.push(this.conModifier)
    this.speedModifier && this.owner.speed.modifiers.push(this.speedModifier)
    this.maxHPModifier && this.owner.maxHP.modifiers.push(this.maxHPModifier)
    this.atkModifier && this.owner.atk.modifiers.push(this.atkModifier)

    for (let i = 0; i < this.skillModifiers.length; i++) {
      const modifier = this.skillModifiers[i]
      this.owner.addSkillModifier(modifier)
    }
  }
}

export namespace Equip {
  // 暂时和 Item 使用同一个 snapshotType，防止细化的类型衍生出过多的 Snapshot 种类
  export interface Snapshot extends Item.Snapshot {
    isEquip: true

    required: EquipRequired

    strModifier?: AttrModifier
    conModifier?: AttrModifier
    speedModifier?: AttrModifier
    maxHPModifier?: AttrModifier
    atkModifier?: AttrModifier
    skillModifiers: SkillModifier[]
  }
}

function getRequiredTexts(required: EquipRequired): string[] {
  const map: Record<keyof EquipRequired, string> = {
    level: '等级需求',
    str: '力量需求',
    con: '体质需求',
  }

  return Object.keys(required)
    .filter((key): key is keyof EquipRequired => key in map)
    .map(key => `${map[key]}：${required[key]}`)
}

function getAttrBonusTexts(item: Equip): string[] {
  const map: Partial<Record<keyof Equip, string>> = {
    strModifier: '力量',
    conModifier: '体质',
    speedModifier: '速度',
    maxHPModifier: '最大生命值',
    atkModifier: '攻击',
  }

  // TODO: 这里的类型和实现问题很大，之后再调整
  return Object.keys(map)
    .map(key => {
      const value = item[key as keyof Equip] as AttrModifier | undefined
      if (value == null) return []

      const arr = []
      if ('add' in value || 'per' in value) {
        if (value.add != null) arr.push(`${map[key as keyof Equip]} +${value.add}`)
        if (value.per != null) arr.push(`${map[key as keyof Equip]} +${value.per * 100}%`)
      } else if ('fixed' in value) {
        if (value.fixed != null) arr.push(`${map[key as keyof Equip]} 固定为 ${value.fixed}`)
      }
      return arr
    })
    .flat()
}

function getSkillBonusTexts(item: Equip): string[] {
  return item.skillModifiers.map(
    modifier => `${new SkillTemplateMap[modifier.skillTemplateId](item.stage).name} +${modifier.upgradeLevel}`,
  )
}

export class WoodenSword extends Equip {
  get slot(): EquipSlot {
    return EquipSlot.MainHead
  }
  get name() {
    return '木剑'
  }
  get description(): string {
    return `木质的剑\n${super.description}`
  }
  get required(): EquipRequired {
    return {
      level: 1,
    }
  }

  atkModifier = { add: 1 }
}

export class ClothArmor extends Equip {
  get slot(): EquipSlot {
    return EquipSlot.Body
  }
  get name() {
    return '布甲'
  }
  get description(): string {
    return `布质的甲\n${super.description}`
  }
  get required(): EquipRequired {
    return {
      level: 1,
    }
  }

  conModifier = { add: 5 }
  maxHPModifier = { per: 0.1 }
}

export class FireWand extends Equip {
  get slot(): EquipSlot {
    return EquipSlot.MainHead
  }
  get name() {
    return '火魔杖'
  }
  get description(): string {
    return `着火的木质魔杖？\n${super.description}`
  }
  get required(): EquipRequired {
    return {
      level: 1,
    }
  }

  atkModifier = { add: 1 }

  skillModifiers = [{ skillTemplateId: SkillTemplateId.Fireballs, upgradeLevel: 1 }]
}
