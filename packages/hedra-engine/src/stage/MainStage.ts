import { CombatStage } from '.'
import { Character } from '..'
import { CombatLog, Snapshot } from '../model/combat_log'
import { Entity } from '../model/entity'
import { Item } from '../model/item'
import { ClothArmor, FireWand } from '../model/item/Equip'
import { ClayGolem } from '../model/skill/active/ClayGolem'
import { Concentrate } from '../model/skill/active/Concentrate'
import { FastContinuousHit } from '../model/skill/active/FastContinuousHit'
import { Fireballs } from '../model/skill/active/Fireballs'
import { PhysicalAttack } from '../model/skill/active/PhysicalAttack'
import { EnhanceConstitution } from '../model/skill/passivity/EnhanceConstitution'
import { SoulReaper } from '../model/skill/passivity/SoulReaper'
import { createRandomEnemy } from '../monster'
import { Store } from '../store'
import { LootGenerator, LootType, Stage } from './types'

const StoreKey = {
  Entity: 'Entity',
  Item: 'Item',
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
    const entity = Entity.deserialize(data, this)
    this.loadedEntityMap.set(entity.id, entity)
    return entity
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

  private loadedItemMap: Map<Item['id'], Item> = new Map()

  getItem(id: Item['id']): Item | null {
    const loadedItem = this.loadedItemMap.get(id)
    if (loadedItem != null) return loadedItem

    const data = this.store.getItem<Item.Serialized>(`${StoreKey.Item}/${id}`)
    if (data == null) return null
    const item = Item.deserialize(data, this)
    this.loadedItemMap.set(item.id, item)
    return item
  }

  // TODO: 这里没想好怎么做 createItem 比较合适，就先这样简单实现了
  registerItem<T extends Item>(item: T): T {
    this.loadedItemMap.set(item.id, item)
    return item
  }

  saveAllToStore(): void {
    this.loadedEntityMap.forEach((entity, id) => {
      this.store.setItem<Entity.Serialized>(
        `${StoreKey.Entity}/${id}`,
        entity.serialize()
      )
    })

    this.loadedItemMap.forEach((item, id) => {
      this.store.setItem<Item.Serialized>(
        `${StoreKey.Item}/${id}`,
        item.serialize()
      )
    })
  }

  // 只为了战利品做一个新的 Monster 类的话有点不必要，但如果直接放 Entity 上也不方便传递给 CombatStage，
  // 所以就直接放到 Stage 上来存储。
  private lootTableMap: Map<Entity['id'], LootGenerator> = new Map()

  setLootGenerator(id: Entity['id'], generator: LootGenerator) {
    this.lootTableMap.set(id, generator)
  }

  getLootGenerator(id: Entity['id']): LootGenerator | null {
    return this.lootTableMap.get(id) ?? null
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
    newPlayer.addSkill(new Fireballs(this))
    newPlayer.addSkill(new ClayGolem(this))
    const fastContinuousHit = new FastContinuousHit(this)
    fastContinuousHit.level = 2
    newPlayer.addSkill(fastContinuousHit)
    const enhanceConstitution = new EnhanceConstitution(this)
    enhanceConstitution.level = 2
    newPlayer.addSkill(enhanceConstitution)
    const soulReaper = new SoulReaper(this)
    soulReaper.killCount = 10
    newPlayer.addSkill(soulReaper)
    const sword = this.registerItem(new FireWand(this))
    newPlayer.equip(sword)
    const armor = this.registerItem(new ClothArmor(this))
    newPlayer.equip(armor)
    return newPlayer
  }

  createRandomEnemyByPlayerLevel(player: Entity): Entity {
    return createRandomEnemy(this, { level: player.level })
  }

  beginCombat(player: Entity, enemies: Entity[]): CombatLog[] {
    // TODO: 调用战斗模拟器
    const combatStage = new CombatStage(this)
    const team1 = [player.id]
    const team2 = enemies.map((entity) => entity.id)
    combatStage.beginCombat([team1, team2])

    combatStage.loots.forEach((loot) => {
      switch (loot.type) {
        case LootType.EXP:
          player.addExp(loot.payload)
          break
        case LootType.Gold:
          player.gold += loot.payload
          break
        case LootType.Item:
          const item = this.registerItem(loot.payload)
          player.addItem(item)
          break
      }
    })

    // TODO: 这里先硬编码查询下，之后要同步数据到 MainStage 中
    const soulReaper = combatStage
      .getEntity(player.id)
      ?.getSkills()
      .find((skill) => skill instanceof SoulReaper) as SoulReaper | undefined
    console.log('灵魂收割者计数器', soulReaper?.killCount)

    return combatStage.logs
  }
}