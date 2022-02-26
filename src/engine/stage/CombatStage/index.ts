import { MainStage, Stage } from '..'
import { Entity } from '../../model/entity'
import { Item } from '../../model/item'
import { Team } from './Team'
import * as R from 'ramda'
import { sample } from 'lodash-es'

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

    const entity = new Entity(this, entityFromMainStage.serialize())
    entity.currentHP = entity.maxHP.value

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

  teams: Team[] = []
  loots: Item[] = []

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
            .map((s) => `[LV.${s.level}] ${s.displayName}: ${s.description}`)
            .join('\n')
        )
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

    console.log('combat end', this)
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
    const battleStarter = this.teams[0]

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
    console.log(`[${source.name}] 击杀了 [${target.name}]`)
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

enum BattleResult {
  Win,
  Lose,
  Timeout,
}
