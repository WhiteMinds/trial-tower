import { Effect } from '../effect'
import { Entity } from '../entity'

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
