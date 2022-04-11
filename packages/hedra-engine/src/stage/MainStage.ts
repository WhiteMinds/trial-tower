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
  constructor(private store: Store) {}

  private loadedEntityMap: Map<Entity['id'], Entity> = new Map()

  async getEntity(id: Entity['id']): Promise<Entity | null> {
    const loadedEntity = this.loadedEntityMap.get(id)
    if (loadedEntity != null) return loadedEntity

    const data = await this.store.getData<Entity.Serialized>(id)
    if (data == null) return null
    const entity = await Entity.deserialize(data, this)
    this.loadedEntityMap.set(entity.id, entity)
    return entity
  }

  async createEntity(data: Partial<Entity.Serialized>): Promise<Entity> {
    const finialData = {
      // TODO: 这里是比较暴力的补全数据方式，不知道还有没有啥好办法
      ...new Entity(this).serialize(),
      ...data,
    }
    // TODO: 如果要优化的话，可以考虑不立刻写入存储，而是等引擎销毁时再写入？
    const serialized = await this.store.createData<Entity.Serialized>(
      finialData
    )
    const entity = await Entity.deserialize(serialized, this)
    this.loadedEntityMap.set(entity.id, entity)
    // TODO: 通知 stage
    return entity
  }

  async destroyEntity(id: Entity['id']): Promise<void> {
    // TODO: 比如临时创建的怪物实体需要销毁
  }

  private loadedItemMap: Map<Item['id'], Item> = new Map()

  async getItem(id: Item['id']): Promise<Item | null> {
    const loadedItem = this.loadedItemMap.get(id)
    if (loadedItem != null) return loadedItem

    const data = await this.store.getData<Item.Serialized>(id)
    if (data == null) return null
    const item = Item.deserialize(data, this)
    this.loadedItemMap.set(item.id, item)
    return item
  }

  // TODO: 这里没想好怎么做 createItem 比较合适，就先这样简单实现了。
  // 或许应该把 createEntity 也改成 register？
  async registerItem<T extends Item>(item: T): Promise<T> {
    const serialized = await this.store.createData(item.serialize())
    const newItem = Item.deserialize(serialized, this)
    this.loadedItemMap.set(newItem.id, newItem)
    return item
  }

  saveAllToStore(): void {
    this.loadedEntityMap.forEach((entity, id) => {
      this.store.setData<Entity.Serialized>(id, entity.serialize())
    })

    this.loadedItemMap.forEach((item, id) => {
      this.store.setData<Item.Serialized>(id, item.serialize())
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

  async createNewPlayerEntity(name: string): Promise<Entity> {
    // TODO: test code
    const newPlayer = await this.createEntity({
      name,
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
    const sword = await this.registerItem(new FireWand(this))
    newPlayer.equip(sword)
    const armor = await this.registerItem(new ClothArmor(this))
    newPlayer.equip(armor)
    return newPlayer
  }

  async createRandomEnemyByPlayerLevel(player: Entity): Promise<Entity> {
    return createRandomEnemy(this, { level: player.level })
  }

  async beginCombat(player: Entity, enemies: Entity[]): Promise<CombatLog[]> {
    // TODO: 调用战斗模拟器
    const combatStage = new CombatStage(this)
    const team1 = [player.id]
    const team2 = enemies.map((entity) => entity.id)
    await combatStage.beginCombat([team1, team2])

    for (const loot of combatStage.loots) {
      switch (loot.type) {
        case LootType.EXP:
          player.addExp(loot.payload)
          break
        case LootType.Gold:
          player.gold += loot.payload
          break
        case LootType.Item:
          const item = await this.registerItem(loot.payload)
          player.addItem(item)
          break
      }
    }

    // TODO: 这里先硬编码查询下，之后要同步数据到 MainStage 中
    // const soulReaper = combatStage
    //   .getEntity(player.id)
    //   ?.getSkills()
    //   .find((skill) => skill instanceof SoulReaper) as SoulReaper | undefined
    // console.log('灵魂收割者计数器', soulReaper?.killCount)

    return combatStage.logs
  }
}
