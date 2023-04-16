import { Skill } from '../Skill'
import { PhysicalAttack } from './PhysicalAttack'

export class ClayGolem extends Skill {
  get name() {
    return '召唤粘土石魔'
  }
  get description() {
    return `召唤 1 个粘土石魔，属性：\n攻击 ${this.atk}\n血量 ${this.maxHP}`
  }

  get atk() {
    return this.level
  }

  get maxHP() {
    return this.level * 10
  }

  async use(): Promise<boolean> {
    this.assertCombatting()
    this.assertOwner()

    const source = this.owner

    const entity = await this.stage.createEntity({
      name: '粘土石魔',
      atk: this.atk,
      maxHP: this.maxHP,
      speed: 10,
    })
    entity.addSkill(new PhysicalAttack(this.stage))

    this.stage.logs.push([source.createSnapshot(), '释放', this.createSnapshot(), '，召唤出', entity.createSnapshot()])

    this.stage.getBelongTeam(source)?.members.push(entity)

    return true
  }
}
