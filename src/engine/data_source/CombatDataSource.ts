import { DataManager, DataManager$InitWithCopy } from './DataManager'
import { GlobalDataSource } from './GlobalDataSource'
import { DataSource, Entity, Item, Skill } from './types'

export class CombatDataSource extends EventTarget implements DataSource {
  entities: DataManager<Entity, Entity.Serialized>
  items: DataManager<Item, Item.Serialized>
  skills: DataManager<Skill, Skill.Serialized>
  // teams

  constructor(private globalDS: GlobalDataSource) {
    super()

    this.entities = new DataManager$InitWithCopy(
      Entity,
      this,
      this.globalDS.entities,
    )
    this.items = new DataManager$InitWithCopy(Item, this, this.globalDS.items)
    this.skills = new DataManager$InitWithCopy(
      Skill,
      this,
      this.globalDS.skills,
    )
  }
}
