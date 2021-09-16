import { DataManager } from './DataManager'
import { GlobalDataSource } from './GlobalDataSource'
import { DataSource, Entity, Item, Skill } from './types'

export class CombatDataSource extends EventTarget implements DataSource {
  entities: DataManager$InitWithCopy<Entity>
  items: DataManager$InitWithCopy<Item>
  skills: DataManager$InitWithCopy<Skill>
  // teams

  constructor(private globalDS: GlobalDataSource) {
    super()

    this.entities = new DataManager$InitWithCopy(this.globalDS.entities)
    this.items = new DataManager$InitWithCopy(this.globalDS.items)
    this.skills = new DataManager$InitWithCopy(this.globalDS.skills)
  }
}

// 这个类主要是实现从来源拷贝一份数据使用，初期先直接全量拷贝，后面有性能问题的时候改成首次使用时再拷贝
class DataManager$InitWithCopy<
  T extends { id: unknown }
> extends DataManager<T> {
  constructor(copySrc: DataManager<T>) {
    super()
    this.data = new Map(copySrc.getPrimaryData())
  }
}
