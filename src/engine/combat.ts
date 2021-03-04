import _ from 'lodash'
import { BehaviorSubject } from 'rxjs'
import { Entity, BattlingEntity, AttrDescriptor } from './model/entity'
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
    this.teams = _.cloneDeep(teams).map(team => ({
      ...team,
      members: team.members.map(toBattlingEntity)
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
      'progress'
    )[0]
  }

  doActionPreparing(entity: BattlingEntity, num: number = AttrDescriptor.getValue(entity, entity.speed)) {
    entity.progress += num
  }

  performAction() {
    const actor = this.actor
    if (!actor) return

    const team = getBelongTeam(this, actor)
    const otherTeams = this.teams.filter((t) => t !== team)
    // 其余队伍全员受到一次伤害
    otherTeams.forEach((t) =>
      t.members.forEach((e) => {
        const damage = AttrDescriptor.getValue(actor, actor.atk)
        e.currentHP -= damage
        this.msgs.push(
          `${actor.name} 攻击了 ${e.name}，造成 ${damage} 伤害，剩余 hp ${e.currentHP}`
        )
      })
    )

    const isBattleEnded = otherTeams
      .map((t) => t.members)
      .flat()
      .every((e) => e.currentHP <= 0)
    // TODO: 这个时候自己也可能死亡了

    if (isBattleEnded) {
      this.result =
        team === this.teams[0] ? BattleResult.Win : BattleResult.Lose
    }
  }
}

function getEntities(state: CombatSystem): BattlingEntity[] {
  return state.teams.map((t) => t.members).flat()
}

function getAliveEntities(state: CombatSystem): BattlingEntity[] {
  return getEntities(state).filter(Entity.isAlive)
}

function getBelongTeam(state: CombatSystem, entity: Entity): undefined | BattlingTeam {
  return state.teams.find((t) => t.members.find((e) => e.id === entity.id))
}

function toBattlingEntity(entity: BehaviorSubject<Entity>): BattlingEntity {
  return {
    ...entity.value,
    progress: 0,
    currentHP: AttrDescriptor.getValue(entity.value, entity.value.maxHP)
  }
}

export interface Team {
  members: BehaviorSubject<Entity>[]
}

interface BattlingTeam {
  members: BattlingEntity[]
}

enum BattleResult {
  Win,
  Lose,
  Timeout,
}
