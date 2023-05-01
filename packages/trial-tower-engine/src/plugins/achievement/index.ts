import { Store, EnginePlugin, Entity } from 'hedra-engine'
import { assert } from '../../utils'

export interface Achievement {
  name: string
  description: string
  completionTime?: number
}

// 插件的持久化系统在接口设计上与引擎是分开的，但是实现时可以选择使用相同结构和实例的来源。
export function createAchievementPlugin(store: Store): EnginePlugin & {
  getPlayerAchievements: (player: Entity) => Promise<Achievement[]>
} {
  const playerAchievementsMap: Record<Entity['id'], Achievement[]> = {}

  return {
    async onKill(killer, target) {
      // TODO: assert killer is player
      const achievements = await this.getPlayerAchievements(killer)
      const newbieAchievement = achievements.find((a): a is NewbieAchievement => a instanceof NewbieAchievement)
      assert(newbieAchievement)
      newbieAchievement.onKill()
    },

    async getPlayerAchievements(player) {
      if (!(player.id in playerAchievementsMap)) {
        // TODO: load data from `store.getData()`.
        playerAchievementsMap[player.id] = [new NewbieAchievement()]
      }
      return playerAchievementsMap[player.id]
    },
  }
}

class NewbieAchievement {
  get name() {
    return '新手上路'
  }
  get description() {
    return `击杀任意 ${this.needKillCount} 个怪物后完成，目前进度：${this.killCount}`
  }

  get completion() {
    return this.completionTime !== null
  }

  completionTime?: number
  killCount = 0
  needKillCount = 10

  onKill() {
    if (this.killCount >= this.needKillCount) return
    this.killCount++
    if (this.killCount >= this.needKillCount) {
      this.completionTime = Date.now()
    }
    console.log('NewbieAchievement on kill', this.killCount, this.completionTime)
    // TODO: this.dirty
  }
}
