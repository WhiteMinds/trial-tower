import { MainStage, Stage } from '..'
import { Entity } from '../../model/entity'
import { Item } from '../../model/item'
import { Team } from './Team'
import * as R from 'ramda'
import { sample } from 'lodash'
import { Loot, Loot$Item, LootGenerator, LootType } from '../types'
import { CombatLog, Snapshot } from '../../model/combat_log'

const MaxRoundCount = 99
// 每次行动需要的进度点数
const ProgressNeedPoint = 100

export class CombatStage implements Stage {
  constructor(private mainStage: MainStage) {}

  private loadedEntityMap: Map<Entity['id'], Entity> = new Map()

  getEntity(id: Entity['id']): Entity | null {
    const loadedEntity = this.loadedEntityMap.get(id)
    if (loadedEntity != null) return loadedEntity

    const entityFromMainStage = this.mainStage.getEntity(id)
    if (entityFromMainStage == null) return null

    const entity = Entity.deserialize(entityFromMainStage.serialize(), this)
    entity.currentHP = entity.maxHP.value

    this.loadedEntityMap.set(entity.id, entity)
    return entity
  }

  createEntity(data: Partial<Entity.Serialized>): Entity {
    const entity = new Entity(this, data)
    entity.currentHP = entity.maxHP.value
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

    const itemFromMainStage = this.mainStage.getItem(id)
    if (itemFromMainStage == null) return null

    const item = Item.deserialize(itemFromMainStage.serialize(), this)

    this.loadedItemMap.set(item.id, item)
    return item
  }

  // TODO: 这里没想好怎么做 createItem 比较合适，就先这样简单实现了
  registerItem<T extends Item>(item: T): T {
    this.loadedItemMap.set(item.id, item)
    return item
  }

  getLootGenerator(id: Entity['id']): LootGenerator | null {
    return this.mainStage.getLootGenerator(id)
  }

  generateLoots(entity: Entity): Loot[] {
    const generator = this.getLootGenerator(entity.id)
    return generator?.(this, entity) ?? []
  }

  teams: Team[] = []
  logs: CombatLog[] = []
  loots: Loot[] = []

  round = 0
  battlingStateMap: Map<Entity['id'], EntityBattlingState> = new Map()
  result: BattleResult | null = null

  // 这里防止调用者直接传递 mainStage 实例化的 entity 过来，所以限制使用 id 传递
  beginCombat(teams: Entity['id'][][]): void {
    this.teams = teams.map(
      (memberIds) =>
        //  TODO: 先给个强制类型转换了，之后调整
        new Team(memberIds.map((memberId) => this.getEntity(memberId)!))
    )

    console.log('# 开始战斗，队伍信息：')
    this.teams.forEach((team, idx) => {
      console.log(`## ${idx + 1} 号队伍成员：`)
      team.members.forEach((entity) => {
        console.log(`### ${entity.name}：`)
        console.log(
          entity
            .getSkills()
            .map((s) => `[LV.${s.level}] ${s.name}: ${s.description}`)
            .join('\n')
        )
        console.log(
          entity.equips
            .map((item) => `====== ${item.name} ======\n${item.description}`)
            .join('\n')
        )
        console.log('计算后的攻击值：', entity.atk.value)
        console.log('计算后的生命值：', entity.maxHP.value)
      })
    })

    let preparingEntity: Entity | null = null
    while (this.result == null) {
      // 解决所有可行动的实体
      const actor = this.getNextActor()
      if (actor) {
        this.getBattlingState(actor).progress -= ProgressNeedPoint
        this.performAction(actor)

        // 每次主循环中调用一次 performAction 算一个回合
        // 另一种设计方法是，每个回合开始时增加所有人的 progress，然后一轮走完
        if (!this.doNextRound()) break

        continue
      }

      // 按顺序增加实体的行动进度
      do {
        preparingEntity = this.getNextPreparingEntity(preparingEntity)
        // 在所有人的速度都为 0 时可能出现这个情况，需要跳回合
        if (preparingEntity == null) {
          if (!this.doNextRound()) break
          continue
        }
        this.doActionPreparing(preparingEntity)
      } while (preparingEntity == null)
    }

    const log: CombatLog = [
      `战斗${
        this.result === BattleResult.Win
          ? '胜利'
          : this.result === BattleResult.Lose
          ? '失败'
          : '超时'
      }`,
    ]
    if (this.loots.length > 0) {
      log.push(
        '，战利品：',
        // TODO: 需要注入顿号分隔
        ...this.loots.map((l) => Loot.createSnapshot(l))
      )
    }
    this.logs.push(log)
  }

  doNextRound(): boolean {
    if (++this.round >= MaxRoundCount) {
      this.result = BattleResult.Timeout
      return false
    }
    // TODO: emit event
    return true
  }

  performAction(actor: Entity): void {
    const team = this.getBelongTeam(actor)
    if (!team) return

    // TODO: 这里需要过滤出可用技能
    const skill = sample(actor.getSkills().filter((skill) => skill.canUse()))
    if (!skill) {
      // 跳过
      return
    }
    skill.use()

    this.setResultIfBattleEnd()
  }

  setResultIfBattleEnd() {
    // 优先判断地方队伍是否全部死亡，然后才是发起者的队伍判断，这是对于战斗发起者的优势条件。
    const battleStarter = this.getBattleStarter()
    if (battleStarter == null) throw new Error('assert battleStarter')

    const enemyTeamsHasAlive = R.any(
      R.prop('isAnyoneAlive'),
      this.getOtherTeams(battleStarter)
    )
    if (!enemyTeamsHasAlive) {
      this.result = BattleResult.Win
      return
    }

    if (!battleStarter.isAnyoneAlive) {
      this.result = BattleResult.Lose
      return
    }
  }

  getNextPreparingEntity(prev: Entity | null): Entity | null {
    const entities = this.getAliveEntities().filter((e) => e.speed.value > 0)
    if (entities.length === 0) return null
    if (!prev) return entities[0]

    const prevIdx = R.findIndex(R.equals(prev), entities)
    return entities[prevIdx + 1] ?? entities[0]
  }

  doActionPreparing(entity: Entity, num: number = entity.speed.value) {
    this.getBattlingState(entity).progress += num
  }

  getNextActor(): Entity | null {
    type EntityWithProgress = {
      entity: Entity
      progress: number
    }

    const getActionableEntitiesSortedByDescendProgress = R.compose(
      R.map(R.prop('entity')),
      R.sortWith<EntityWithProgress>([R.descend(R.prop('progress'))]),
      R.filter<EntityWithProgress>(
        ({ progress }) => progress >= ProgressNeedPoint
      ),
      R.map<Entity, EntityWithProgress>((entity) => ({
        entity,
        progress: this.getBattlingState(entity).progress,
      }))
    )

    const actionableEntities = getActionableEntitiesSortedByDescendProgress(
      this.getAliveEntities()
    )
    return R.head(actionableEntities) ?? null
  }

  getBattlingState(entity: Entity): EntityBattlingState {
    const existedState = this.battlingStateMap.get(entity.id)
    if (existedState != null) return existedState

    const state: EntityBattlingState = {
      progress: 0,
    }
    this.battlingStateMap.set(entity.id, state)
    return state
  }

  // 生命周期

  onKill(source: Entity, target: Entity): void {
    // TODO: 这里有点问题，会比最后一次攻击的输出要早，有待调整

    // TODO: 这里先简单点实现，重复死亡之类的之后再考虑
    const battleStarter = this.getBattleStarter()
    if (battleStarter == null) throw new Error('assert battleStarter')

    const log: CombatLog = [
      source.createSnapshot(),
      '击杀了',
      target.createSnapshot(),
    ]
    if (!battleStarter.contains(target)) {
      const loots = this.generateLoots(target)
      if (loots.length > 0) {
        this.loots.push(...loots)
        log.push(
          '，战利品：',
          // TODO: 需要注入顿号分隔
          ...loots.map((l) => Loot.createSnapshot(l))
        )
      }
    }
    this.logs.push(log)

    source.getSkills().forEach((skill) => skill.onKill(target))
  }

  // utils

  getEntities(): Entity[] {
    return this.teams.map((team) => team.members).flat()
  }

  getAliveEntities(): Entity[] {
    return this.getEntities().filter((entity) => entity.isAlive)
  }

  getBelongTeam(entity: Entity): Team | null {
    return R.find((team) => team.contains(entity), this.teams) ?? null
  }

  getTeammates(entity: Entity): Entity[] {
    const isNotSelf = R.compose(R.not, R.equals(entity))
    const members = this.getBelongTeam(entity)?.members ?? []
    return R.filter(isNotSelf, members)
  }

  getOtherTeams(team: Team): Team[]
  getOtherTeams(entity: Entity): Team[]
  getOtherTeams(entityOrTeam: Entity | Team): Team[]
  getOtherTeams(entityOrTeam: Entity | Team): Team[] {
    const selfTeam =
      entityOrTeam instanceof Entity
        ? this.getBelongTeam(entityOrTeam)
        : entityOrTeam

    const isNotSelf = R.compose(R.not, R.equals(selfTeam))
    return R.filter(isNotSelf, this.teams)
  }

  getBattleStarter(): Team | null {
    return this.teams[0]
  }

  getEnemies(...args: Parameters<CombatStage['getOtherTeams']>): Entity[] {
    return this.getOtherTeams(...args)
      .map((t) => t.members)
      .flat()
  }

  getAliveEnemies(...args: Parameters<CombatStage['getEnemies']>): Entity[] {
    return R.filter((e) => e.isAlive, this.getEnemies(...args))
  }

  getFirstAliveEnemy(
    ...args: Parameters<CombatStage['getAliveEnemies']>
  ): Entity | null {
    return R.head(this.getAliveEnemies(...args)) ?? null
  }
}

interface EntityBattlingState {
  progress: number
}

export enum BattleResult {
  Win = 1,
  Lose,
  Timeout,
}
