import { MainStage } from './MainStage'
import { createStageStore } from './store'

export class CombatStage extends MainStage {
  constructor(public mainStage: MainStage) {
    super()

    this.store = createStageStore({
      // 相当于从主舞台全量克隆了数据
      defaultState: mainStage.store.state$.value,
    })

    this.combatStore

    // this.entities.on('ItemAdded', (entity) =>
    //   this.emit('EntityCreated', entity),
    // )
    // this.items.on('ItemAdded', (item) => this.emit('ItemCreated', item))
  }
}
