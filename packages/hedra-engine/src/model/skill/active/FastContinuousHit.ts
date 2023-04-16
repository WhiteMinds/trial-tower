import { random } from 'lodash'
import * as R from 'ramda'
import { Stage } from '../../../stage'
import { createUniqueId } from '../../../utils'
import { CombatLog } from '../../combat_log'
import { DamageEffect } from '../../effect'
import { Skill } from '../Skill'

export class FastContinuousHit extends Skill {
  get name() {
    return '快速连击'
  }
  get description() {
    return `对单体目标造成 2 ~ ${this.maxHitCount} 次的 0.8 * atk 的伤害，可附加攻击特效`
  }

  readonly canDisarm = true

  get maxHitCount() {
    return 4 + this.level
  }

  async use(): Promise<boolean> {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner
    const target = this.stage.getFirstAliveEnemy(source)
    if (target == null) return false

    const effectGroupId = createUniqueId()
    const stage = this.stage
    const damages = R.range(0, random(2, this.maxHitCount)).map(() => {
      const damage = new DamageEffect(stage, source, effectGroupId)
      damage.baseValue = source.atk.value * 0.8
      damage.canAddAttackEffect = true
      return damage
    })

    // 不能在 onCaptureEffectsSending 之后 createSnapshot，因为可能会造成数据变化
    const log: CombatLog = [source.createSnapshot(), '对', target.createSnapshot(), '释放', this.createSnapshot()]
    this.stage.logs.push(log)

    source.getBuffs().forEach(buff => buff.onCaptureEffectsSending(damages))

    const damageValues = damages.map(damage => damage.cast(this.stage, target))
    log.push(`造成 ${damageValues.join('、')} 伤害，剩余 hp ${target.currentHP}`)

    return true
  }
}
