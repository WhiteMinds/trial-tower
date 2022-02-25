import { CombatStage, Stage } from '../../stage'
import { UniqueId } from '../../types'
import { Buff } from '../buff'
import { Entity } from '../entity'

export interface Effect {
  groupId: UniqueId

  // TODO: 类型不太好写，先单独放到各个实现类里了
  // modifiers: ((target: Entity, effect: Effect) => Effect)[]
}

export class DamageEffect implements Effect {
  modifiers: ((target: Entity, effect: this) => void)[] = []

  baseValue: number = 0
  // 这里先设计的简单点，effect modifier 要倍乘 value 数值时直接改这里，这样就
  // 不用做成类似 AttrDescriptor 的模式了。
  multiplier: number = 1

  // 伤害的属性类型，如果多种属性应该是多个 Effect 实例
  property: DamageProperty = DamageProperty.None
  // 是否能够附加攻击特效，这将决定一些 modifier 是否被添加，以及是否额外生成一些 effect。
  // 例如转换攻击属性、改变攻击数值、新增一个 GrantBuffEffect 等。
  canAddAttackEffect = false
  // 远程攻击，对应的处理可能有命中率减益
  isRangedAttack = false
  // 魔法攻击，对应的处理可能是魔抗之类的
  isMagic = false

  constructor(
    public stage: CombatStage,
    public source: Entity,
    public groupId: UniqueId
  ) {}

  // 当前的设计是一个 effect 只能 apply 一次，除非做成不可变数据或可克隆的。
  // 每个 Effect 的 apply 会返回不同的处理数据，方便调用者做记录。
  cast(stage: Stage, target: Entity): number {
    this.modifiers.forEach((modifier) => modifier(target, this))
    const value = Math.floor(this.baseValue * this.multiplier)
    // TODO: 这是为了防止死亡后的攻击，比如一组 DamageEffect，死亡后就不应该继续触发了，或者
    // 应该由 stage 来控制
    if (!target.isAlive) {
      return value
    }
    // TODO: 如果不允许伤害溢出的话，可以在这里做 Math.min 操作，或者通过 target.decreaseHP 封装
    target.currentHP -= value
    if (!target.isAlive) {
      // TODO: 这里是不是应该调用 stage.onHit / onDamage，然后在它内部做 onKill 检查？
      this.stage.onKill(this.source, target)
    }
    return value
  }
}

enum DamageProperty {
  None,
  Fire,
  Water,
}

export class GrantBuffEffect implements Effect {
  modifiers: ((target: Entity, effect: this) => void)[] = []

  constructor(public groupId: UniqueId, public buff: Buff) {}

  cast(stage: Stage, target: Entity): boolean {
    this.modifiers.forEach((modifier) => modifier(target, this))
    target.grantBuff(this.buff)
    return true
  }
}
