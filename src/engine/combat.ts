import _ from 'lodash'
import { Entity, BattlingEntity } from './model/entity'
import { Equip } from './model/equip'

// 每次行动需要的进度点数
const ProgressNeedPoint = 100

export class CombatSystem extends EventTarget {
  teams: BattlingTeam[]
  msgs: string[] = []
  loots: Equip['id'][] = []
  result?: BattleResult
  // TODO: actor 真的有必要存在 system 对象上吗
  /** @desc 当前的行动者 */
  actor?: BattlingEntity

  constructor(...teams: Team[]) {
    super()
    // 克隆，并转换 Entity 为 BattlingEntity
    this.teams = _.cloneDeep(teams).map((team) => ({
      ...team,
      members: team.members.map(BattlingEntity.from),
    }))
  }

  start(): Pick<CombatSystem, 'result' | 'msgs' | 'loots'> {
    let preparingEntity: undefined | BattlingEntity
    while (this.result ?? true) {
      // 解决所有可行动的实体
      this.actor = this.getNextActor()
      if (this.actor) {
        this.actor.progress -= ProgressNeedPoint
        this.performAction()
        delete this.actor
        continue
      }

      // 按顺序增加实体的行动进度
      preparingEntity = this.getNextPreparingEntity(preparingEntity)
      this.doActionPreparing(preparingEntity)
    }

    return _.pick(this, ['result', 'msgs', 'loots'])
  }

  getNextPreparingEntity(prev?: Entity): BattlingEntity {
    const entities = getAliveEntities(this)
    if (!prev) return entities[0]
    const prevIdx = entities.findIndex((e) => e === prev)
    return entities[prevIdx + 1] ?? entities[0]
  }

  getNextActor(): undefined | BattlingEntity {
    return _.sortBy(
      getAliveEntities(this).filter((e) => e.progress >= ProgressNeedPoint),
      'progress',
    )[0]
  }

  doActionPreparing(entity: BattlingEntity, num: number = entity.speed.value) {
    entity.progress += num
  }

  performAction() {
    const actor = this.actor
    if (!actor) return

    const team = this.getBelongTeam(actor)
    if (!team) return

    if (actor.skills.value.length > 0 && _.random(1, 2) === 1) {
      // 释放技能
      const skill = _.sample(actor.skills.value)!
      skill.onUse(this)
    } else {
      // 普通攻击
      const e = this.getFirstEnemy(actor)!
      const damage = actor.atk.value
      e.currentHP -= damage
      this.msgs.push(
        `${actor.name} 攻击了 ${e.name}，造成 ${damage} 伤害，剩余 hp ${e.currentHP}`,
      )
    }

    this.setResultIfBattleEnd()
  }

  setResultIfBattleEnd() {
    if (!this.actor) return
    const actorTeam = this.getBelongTeam(this.actor)
    if (!actorTeam) return

    const battleStarter = this.teams[0]
    const enemyTeams = this.getOtherTeams(battleStarter)

    const enemyTeamsHasAlive = enemyTeams
      .map((t) => t.members)
      .flat()
      .some(Entity.isAlive)

    if (!enemyTeamsHasAlive) {
      this.result = BattleResult.Win
      return
    }

    const selfTeamHasAlive = battleStarter.members.some(Entity.isAlive)
    if (!selfTeamHasAlive) {
      this.result = BattleResult.Lose
    }
  }

  // Utils
  // ===========================================================================

  getBelongTeam(entity: Entity): undefined | BattlingTeam {
    return this.teams.find((t) => t.members.find((e) => e.id === entity.id))
  }

  getOtherTeams(team: BattlingTeam): BattlingTeam[]
  getOtherTeams(entity: Entity): BattlingTeam[]
  getOtherTeams(entityOrTeam: Entity | BattlingTeam): BattlingTeam[] {
    const selfTeam =
      entityOrTeam instanceof Entity
        ? this.getBelongTeam(entityOrTeam)
        : entityOrTeam
    return this.teams.filter((t) => t !== selfTeam)
  }

  getFirstEnemy(entity: Entity): undefined | BattlingEntity {
    return this.getOtherTeams(entity)?.[0]?.members?.[0]
  }
}

function getEntities(state: CombatSystem): BattlingEntity[] {
  return state.teams.map((t) => t.members).flat()
}

function getAliveEntities(state: CombatSystem): BattlingEntity[] {
  return getEntities(state).filter(Entity.isAlive)
}

export interface Team {
  members: Entity[]
}

interface BattlingTeam {
  members: BattlingEntity[]
}

enum BattleResult {
  Win,
  Lose,
  Timeout,
}
