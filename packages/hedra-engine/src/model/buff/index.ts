import R from 'ramda'
import { DamageEffect, Effect } from '../effect'
import { Entity } from '../entity'
import { AttrModifier } from '../entity/AttrDescriptor'

export class Buff {
  get name() {
    return 'BaseBuff'
  }
  get description() {
    return 'BaseBuff'
  }

  // 战斗时使用
  remainingRound = 0
  // 非战斗时使用
  endTime = Date.now()

  stacked = 1

  // TODO: owner 是不是应该在 onCasted 时才赋予？
  constructor(public owner: Entity) {}

  createSnapshot(): Buff.Snapshot {
    return {
      name: this.name,
      description: this.description,
      stacked: this.stacked,
    }
  }

  // 被赋予时触发
  onCasted(): void {}

  // 检测到宿主发出 effect 时，对其处理
  onCaptureEffectsSending(effects: Effect[]): void {}

  // 检测到宿主受到 effect 时，对其处理
  onCaptureEffectCasted(): void {}

  mixing(buff: this): boolean {
    this.remainingRound += buff.remainingRound
    return true
  }
}

export namespace Buff {
  export interface Snapshot {
    name: string
    description: string
    stacked: number
  }
}

export class ConcentrateBuff extends Buff {
  get name() {
    return '全神贯注'
  }
  get description() {
    return '下 1 次攻击伤害提升 100%'
  }

  remainingRound = Infinity

  constructor(public owner: Entity, public stacked = 3) {
    super(owner)
  }

  onCaptureEffectsSending(effects: Effect[]) {
    effects.forEach((effect) => {
      if (!(effect instanceof DamageEffect)) return
      if (effect.source !== this.owner) return

      if (this.stacked <= 0) return
      this.stacked--

      effect.modifiers.push((target, effect) => {
        effect.multiplier += 1
      })
    })

    // TODO: 之后要抽出去做成辅助函数，比如 setStacked 之类的里面检查
    if (this.stacked <= 0) {
      this.owner.withdrawBuff(this)
    }
  }

  mixing(buff: this): boolean {
    this.stacked += buff.stacked
    return true
  }
}

export class EnhanceConstitutionBuff extends Buff {
  get name() {
    return '体质强化'
  }
  get description() {
    return `提升 ${this.enhancePctCount * 100}% 的体质`
  }

  remainingRound = Infinity
  endTime = Infinity

  constitutionModifier: AttrModifier

  constructor(public owner: Entity, public enhancePctCount: number) {
    super(owner)

    this.constitutionModifier = {
      per: enhancePctCount,
    }
  }

  onCasted() {
    this.owner.constitution.modifiers.push(this.constitutionModifier)
  }
}

export class SoulReaperBuff extends Buff {
  get name() {
    return '灵魂收割者'
  }
  get description() {
    return `提升 ${this.stacked} 点最大生命值`
  }

  remainingRound = Infinity
  endTime = Infinity

  maxHPModifier: AttrModifier

  constructor(public owner: Entity, public stacked: number) {
    super(owner)

    this.maxHPModifier = {
      add: stacked,
    }
  }

  onCasted() {
    this.owner.maxHP.modifiers.push(this.maxHPModifier)
  }

  mixing(buff: this): boolean {
    this.changeEnhanceCount(buff.stacked)
    return true
  }

  changeEnhanceCount(value: number) {
    // TODO: 之后应该通过 AttrModifier 的 api 来操作。
    // 或者直接修改 this.maxHPModifier 的值？
    const idx = this.owner.maxHP.modifiers.indexOf(this.maxHPModifier)
    if (idx === -1) {
      throw new Error(
        'Cant call SoulReaperBuff.changeEnhanceCount before casted'
      )
    }
    this.owner.maxHP.modifiers.splice(idx, 1)
    this.maxHPModifier = {
      ...this.maxHPModifier,
      add: value,
    }
    this.owner.maxHP.modifiers.push(this.maxHPModifier)
  }
}
