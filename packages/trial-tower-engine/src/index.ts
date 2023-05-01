import { Engine, Entity } from 'hedra-engine'
import { registerItemTemplates } from './items'
import { registerSkillTemplates } from './skills'
import { createRandomEnemy } from './entities'
import { ClothArmor } from './items/equip/ClothArmor'
import { FireWand } from './items/equip/FireWand'
import { ClayGolem } from './skills/active/ClayGolem'
import { Concentrate } from './skills/active/Concentrate'
import { FastContinuousHit } from './skills/active/FastContinuousHit'
import { Fireballs } from './skills/active/Fireballs'
import { PhysicalAttack } from './skills/active/PhysicalAttack'
import { EnhanceConstitution } from './skills/passivity/EnhanceConstitution'
import { SoulReaper } from './skills/passivity/SoulReaper'

export * from 'hedra-engine'
export * from './items'
export * from './skills'

registerItemTemplates()
registerSkillTemplates()

export class TrialTowerEngine extends Engine {
  constructor(...args: ConstructorParameters<typeof Engine>) {
    super(...args)
  }

  async createRandomEnemyByPlayerLevel(player: Entity): Promise<Entity> {
    return createRandomEnemy(this.mainStage, { level: player.level })
  }

  // TODO: 应该放在 mainStage 上，或者通过 player 创建事件来附加额外数据
  async createNewPlayerEntity(name: string): Promise<Entity> {
    // TODO: test code
    const newPlayer = await this.mainStage.createEntity({
      name,
      constitution: 10,
      maxHP: 10,
      atk: 2,
      speed: 10,
    })
    newPlayer.addSkill(new PhysicalAttack(this.mainStage))
    newPlayer.addSkill(new Concentrate(this.mainStage))
    newPlayer.addSkill(new Fireballs(this.mainStage))
    newPlayer.addSkill(new ClayGolem(this.mainStage))
    const fastContinuousHit = new FastContinuousHit(this.mainStage)
    fastContinuousHit.level = 2
    newPlayer.addSkill(fastContinuousHit)
    const enhanceConstitution = new EnhanceConstitution(this.mainStage)
    enhanceConstitution.level = 2
    newPlayer.addSkill(enhanceConstitution)
    const soulReaper = new SoulReaper(this.mainStage)
    soulReaper.killCount = 10
    newPlayer.addSkill(soulReaper)
    const sword = await this.mainStage.registerItem(new FireWand(this.mainStage))
    newPlayer.equip(sword)
    const armor = await this.mainStage.registerItem(new ClothArmor(this.mainStage))
    newPlayer.equip(armor)
    return newPlayer
  }
}
