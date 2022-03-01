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

    const damageValues = targets.map((target) => {
      const damage = new DamageEffect(stage, source, effectGroupId)
      damage.baseValue = source.atk.value

      source
        .getBuffs()
        .forEach((buff) => buff.onCaptureEffectsSending([damage]))

      const damageValue = damage.cast(this.stage, target)
      return damageValue
    })

    this.stage.logs.push([
      // TODO: 可以尝试做成 {target[]} 之类的，或者做工具函数来简化。
      // 或者 {targets[0]}，然后提供 targets。
      `{source}对${targets
        .map((t, idx) => `{target${idx}}`)
        .join('、')}释放{skill}，造成 ${damageValues.join('、')} 伤害`,
      {
        source: source.createSnapshot(),
        skill: this.createSnapshot(),
        ...targets.reduce((map, val, idx) => {
          map['target' + idx] = val.createSnapshot()
          return map
        }, {} as Record<string, Snapshot>),
      },
    ])

    return true
  }
}
