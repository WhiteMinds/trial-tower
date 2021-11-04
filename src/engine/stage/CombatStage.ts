import { ObjectManager, ObjectManager$InitWithCopy } from './ObjectManager'
import { MainStage } from './MainStage'
import { Entity, Item, Skill } from './types'

// type CombatStageEventTypes = {}

export class CombatStage extends MainStage {
  entities: ObjectManager<Entity, Entity.Serialized>
  items: ObjectManager<Item, Item.Serialized>
  skills: ObjectManager<Skill, Skill.Serialized>
  // teams

  constructor(private mainStage: MainStage) {
    super()

    this.entities = new ObjectManager$InitWithCopy(
      this,
      this.mainStage.entities,
    )
    this.items = new ObjectManager$InitWithCopy(this, this.mainStage.items)
    this.skills = new ObjectManager$InitWithCopy(this, this.mainStage.skills)
  }
}
