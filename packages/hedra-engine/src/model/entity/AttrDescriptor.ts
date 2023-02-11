import { Entity } from '.'
import { UniqueId } from '../../types'

export class AttrDescriptor {
  constructor(public entity: Entity, private onBaseUpdate?: () => void) {}

  // 基础值
  _base = 0
  get base() {
    return this._base
  }
  set base(val) {
    this._base = val
    this.onBaseUpdate?.()
  }

  // 衍生值，由（基础值 + 某些属性经过公式计算后的值）所衍生出的结果
  get derived() {
    return this.base
  }

  // 属性修饰器
  modifiers: AttrModifier[] = []

  // 最终值，将所有修饰器应用于衍生值后得出的结果
  get value() {
    return Math.round(AttrDescriptor.getValue(this))
  }
}

export class AttrDescriptor$HealthPoint extends AttrDescriptor {
  get derived() {
    return this.base + this.entity.constitution.value * 5
  }
}

export class AttrDescriptor$Attack extends AttrDescriptor {
  get derived() {
    return this.base + Math.floor(this.entity.strength.value / 2)
  }
}

export type AttrModifier = { source?: UniqueId } & (
  | {
      fixed: number
    }
  | {
      add?: number
      per?: number
    }
)

export namespace AttrDescriptor {
  export function getValue(descriptor: AttrDescriptor): number {
    if (descriptor.modifiers.length === 0) return descriptor.derived

    const modifier = combineAttrModifier(descriptor.modifiers)
    if ('fixed' in modifier) return modifier.fixed

    const add = modifier.add ?? 0
    const per = 1 + (modifier.per ?? 0)
    return (descriptor.derived + add) * per
  }
}

function combineAttrModifier(modifiers: AttrModifier[]): AttrModifier {
  return modifiers.reduce((result, modifier) => {
    // 固定值的优先级最高
    if ('fixed' in modifier) return modifier
    if ('fixed' in result) return result

    return {
      add: (result.add ?? 0) + (modifier.add ?? 0),
      per: (result.per ?? 0) + (modifier.per ?? 0),
    }
  })
}
