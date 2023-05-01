import { CombatStage } from '.'
import { CombatLog } from '../model/combat_log'
import { Entity } from '../model/entity'
import { Item } from '../model/item'
import { EnginePlugin } from '../plugins'
import { Store } from '../store'
import { UniqueId } from '../types'
import { assert } from '../utils'
import { LootGenerator, LootType, Stage } from './types'

export class MainStage implements Stage {
  constructor(private store: Store, private plugins: EnginePlugin[]) {}

  private loadedEntityMap: Map<Entity['id'], Entity> = new Map()

  async getEntity(id: Entity['id']): Promise<Entity | null> {
    const loadedEntity = this.loadedEntityMap.get(id)
    if (loadedEntity != null) return loadedEntity

    // TODO: 需要一个 loading flag，防止同时执行多次
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
    const serialized = await this.store.createData<Entity.Serialized>(finialData)
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
    // TODO: 这个 `as T` 会不会有什么隐患？
    const newItem = Item.deserialize(serialized, this) as T
    this.loadedItemMap.set(newItem.id, newItem)
    return newItem
  }

  dirty<T extends { id: UniqueId }>(target: { id: UniqueId; serialize: () => T }) {
    this.store.setData<T>(target.id, target.serialize())
  }

  async saveAllToStore(): Promise<void> {
    await Promise.all(
      Array.from(this.loadedEntityMap.entries()).map(([id, entity]) =>
        this.store.setData<Entity.Serialized>(id, entity.serialize()),
      ),
    )

    await Promise.all(
      Array.from(this.loadedItemMap.entries()).map(([id, item]) =>
        this.store.setData<Item.Serialized>(id, item.serialize()),
      ),
    )
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

  async beginCombat(player: Entity, enemies: Entity[]): Promise<CombatLog[]> {
    // TODO: 调用战斗模拟器
    const combatStage = new CombatStage(this)
    const team1 = [player.id]
    const team2 = enemies.map(entity => entity.id)
    await combatStage.prepare([...team1, ...team2])
    await combatStage.beginCombat([team1, team2])

    for (const loot of combatStage.loots) {
      switch (loot.type) {
        case LootType.EXP:
          player.addExp(loot.payload)
          break
        case LootType.Gold:
          player.addGold(loot.payload)
          break
        case LootType.Item:
          player.addItem(await this.registerItem(loot.payload))
          break
      }
    }

    // 触发各个生命周期

    // TODO: 目前先简单点，events 直接从 logs 里硬编码生成，之后再调整
    const killEvents = combatStage.logs
      .filter((log): log is [Entity.Snapshot, string, Entity.Snapshot] => log[1] === '击杀了')
      .map(log => Promise.all([combatStage.getEntity(log[0].id), combatStage.getEntity(log[2].id)]))
    for await (const [killer, target] of killEvents) {
      assert(killer)
      assert(target)
      for (const plugin of this.plugins) {
        await plugin.onKill?.(killer, target)
      }
    }

    for (const skill of player.getSkills()) {
      await skill.onCombatEnd(combatStage)
    }

    // TODO: trigger events from logs

    // TODO: combatStage.destroy()
    return combatStage.logs
  }
}
