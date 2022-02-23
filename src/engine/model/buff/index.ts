import { DamageEffect, Effect } from '../effect'
import { Entity } from '../entity'
import { AttrModifier } from '../entity/AttrDescriptor'

export class Buff {
  // TODO: owner 是不是应该在 onCasted 时才赋予？
  constructor(public owner: Entity) {}

  // 战斗时使用
  remainingRound: number = 0
  // 非战斗时使用
  endTime: number = Date.now()

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

export class ConcentrateBuff extends Buff {
  remainingRound = Infinity

  constructor(public owner: Entity, public remainingCount = 3) {
    super(owner)
  }

  onCaptureEffectsSending(effects: Effect[]) {
    effects.forEach((effect) => {
      if (this.remainingCount <= 0) return
      if (!(effect instanceof DamageEffect)) return

      effect.modifiers.push((target, effect) => {
        effect.multiplier += 1
        this.remainingCount--
      })
    })
  }

  mixing(): boolean {
    this.remainingCount += 3
    return true
  }
}

export class EnhanceConstitutionBuff extends Buff {
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
