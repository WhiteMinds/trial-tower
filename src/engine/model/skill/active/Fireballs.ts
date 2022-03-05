import { createUniqueId } from '../../../utils'
import { Snapshot } from '../../combat_log'
import { DamageEffect } from '../../effect'
import { Skill } from '../Skill'

export class Fireballs extends Skill {
  get name() {
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

    const damages = targets.map((target) => {
      const damage = new DamageEffect(stage, source, effectGroupId)
      damage.baseValue = source.atk.value
      source
        .getBuffs()
        .forEach((buff) => buff.onCaptureEffectsSending([damage]))
      return damage
    })
    const damageValues = damages.map((damage, idx) => {
      const target = targets[idx]
      const damageValue = damage.calcValue(target)
      return damageValue
    })

    this.stage.logs.push([
      source.createSnapshot(),
      '对',
      // TODO: 要注入顿号分隔
      ...targets.map((t) => t.createSnapshot()),
      '释放',
      this.createSnapshot(),
      `造成 ${damageValues.join('、')} 伤害`,
    ])

    damages.forEach((damage, idx) => {
      const target = targets[idx]
      damage.cast(this.stage, target)
    })

    return true
  }
}
