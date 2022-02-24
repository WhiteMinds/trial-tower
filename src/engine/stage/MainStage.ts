import { CombatStage } from '.'
import { Character } from '..'
import { Entity } from '../model/entity'
import { Concentrate } from '../model/skill/active/Concentrate'
import { FastContinuousHit } from '../model/skill/active/FastContinuousHit'
import { PhysicalAttack } from '../model/skill/active/PhysicalAttack'
import { EnhanceConstitution } from '../model/skill/passivity/EnhanceConstitution'
import { Store } from '../store'
import { Stage } from './types'

const StoreKey = {
  Entity: 'Entity',
}

export class MainStage implements Stage {
  constructor(private character: Character, private store: Store) {}

  private loadedEntityMap: Map<Entity['id'], Entity> = new Map()

  getEntity(id: Entity['id']): Entity | null {
    const loadedEntity = this.loadedEntityMap.get(id)
    if (loadedEntity != null) return loadedEntity

    const data = this.store.getItem<Entity.Serialized>(
      `${StoreKey.Entity}/${id}`
    )
    if (data == null) return null
    return new Entity(this, data)
  }

  createEntity(data: Partial<Entity.Serialized>): Entity {
    const entity = new Entity(this, data)
    this.loadedEntityMap.set(entity.id, entity)
    // TODO: 通知 stage
    return entity
  }

  destroyEntity(id: Entity['id']): void {
    // TODO: 比如临时创建的怪物实体需要销毁
  }

  getPlayer(): Entity {
    const player = this.getEntity(this.character.id)
    if (player != null) return player

    // TODO: test code
    const newPlayer = this.createEntity({
      id: this.character.id,
      name: 'WhiteMind',
      constitution: 10,
      maxHP: 10,
      atk: 2,
      speed: 10,
    })
    newPlayer.addSkill(new PhysicalAttack(this))
    newPlayer.addSkill(new Concentrate(this))
    const fastContinuousHit = new FastContinuousHit(this)
    fastContinuousHit.level = 2
    newPlayer.addSkill(fastContinuousHit)
    const enhanceConstitution = new EnhanceConstitution(this)
    enhanceConstitution.level = 2
    newPlayer.addSkill(enhanceConstitution)
    return newPlayer
  }

  createRandomEnemyByPlayerLevel(player: Entity): Entity {
    // TODO: 根据玩家等级进行随机生成
    const entity = this.createEntity({
      name: '怪物',
      maxHP: 10,
      atk: 1,
      speed: 10,
    })
    entity.addSkill(new PhysicalAttack(this))
    return entity
  }

  beginCombat(player: Entity, enemies: Entity[]): void {
    console.log(player, enemies)
    // TODO: 调用战斗模拟器
    const combatStage = new CombatStage(this)
    const team1 = [player.id]
    const team2 = enemies.map((entity) => entity.id)
    combatStage.beginCombat([team1, team2])
  }
}
