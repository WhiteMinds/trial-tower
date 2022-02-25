import { createUniqueId } from '../../../utils'
import { DamageEffect } from '../../effect'
import { Skill } from '../Skill'

export class Fireballs extends Skill {
  get displayName() {
    return '群体火球术'
  }
  get description() {
    return `对 ${this.targetCount} 个目标造成 1 * atk 的伤害`
  }

  get targetCount() {
    return 1 + this.level
  }

  use(): boolean {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner
    const target = this.stage.getFirstAliveEnemy(source)
    const targets = this.stage
      .getAliveEnemies(source)
      .slice(0, this.targetCount)

    const effectGroupId = createUniqueId()
    const stage = this.stage

    const damageValues = targets.map((target) => {
      const damage = new DamageEffect(stage, source, effectGroupId)
      damage.baseValue = source.atk.value

      source
        .getBuffs()
        .forEach((buff) => buff.onCaptureEffectsSending([damage]))

      const damageValue = damage.cast(this.stage, target)
      return damageValue
    })

    console.log(
      `[${source.name}] 对 [${targets.map((t) => t.name).join('、')}] 释放 [${
        this.displayName
      }]，造成 ${damageValues.join('、')} 伤害`
    )

    return true
  }
}
