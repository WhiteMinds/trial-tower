import { UniqueId } from '../../types'
import { Entity } from '../entity'

interface Effect {
  groupId: UniqueId

  // TODO: 类型不太好写，先单独放到各个实现类里了
  // modifiers: ((target: Entity, effect: Effect) => Effect)[]
}

export class DamageEffect implements Effect {
  modifiers: ((target: Entity, effect: DamageEffect) => DamageEffect)[] = []

  value: number = 0
  property: DamageProperty = DamageProperty.None
  // 是否能够附加攻击特效，这将决定一些 modifier 是否被添加，以及是否额外生成一些 effect。
  // 例如转换攻击属性、改变攻击数值、新增一个 GrantBuffEffect 等。
  canAddAttackEffect = false
  // 远程攻击，对应的处理可能有命中率减益
  isRangedAttack = false
  // 魔法攻击，对应的处理可能是魔抗之类的
  isMagic = false

  constructor(public groupId: UniqueId) {}
}

enum DamageProperty {
  None,
  Fire,
  Water,
}
