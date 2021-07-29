import { BehaviorSubject, Subject } from 'rxjs'
import { CombatSystem, Team } from './combat'
import { BattlingEntity, Entity } from './model/entity'
import { EquipModule } from './module/equip'

export class Engine extends EventTarget {
  entitySubjects = {
    init: new Subject<Entity>(),
    beforeAttack: new Subject<{
      combat: CombatSystem
      entity: BattlingEntity
      damage: number
    }>(),
    beforeDamage: new Subject<{
      combat: CombatSystem
      entity: BattlingEntity
      damage: number
    }>(),
  }
  // 需要使用 entitySubjects 的 module 应该在其下方初始化，否则会拿不到
  equipModule = new EquipModule(this)

  combat(...teams: Team[]) {
    const sys = new CombatSystem(...teams)
    return sys.start()
  }
}

interface Item {
  id: string
  name: string
  // ... other attrs ...
}

interface Skill {
  id: string
  name: string
  // ... other attrs ...
}

interface DataSource {
  items: DataManager<Item>
}

class DataManager<T extends { id: unknown }> {
  data = new Map<T['id'], T>()
  private subs = new Map<T['id'], BehaviorSubject<T>>()

  get(id: T['id']): BehaviorSubject<T> | null {
    const sub = this.subs.get(id)
    if (sub) return sub
    const item = this.data.get(id)
    if (!item) return null

    const subject = new BehaviorSubject(item)
    subject.subscribe((val) => this.data.set(id, val))
    this.subs.set(id, subject)

    return subject
  }

  set(id: T['id'], val: T): void {
    this.data.set(id, val)
    this.subs.get(id)?.next(val)
  }
}

// 这个类主要是实现从来源拷贝一份数据使用，初期先直接全量拷贝，后面有性能问题的时候改成首次使用时再拷贝
class DataManager$InitWithCopy<
  T extends { id: unknown }
> extends DataManager<T> {
  constructor(copySrc: DataManager<T>) {
    super()
    this.data = new Map(copySrc.data)
  }
}

class GlobalDataSource extends EventTarget implements DataSource {
  entities = new DataManager<Entity>()
  items = new DataManager<Item>()
  skills = new DataManager<Skill>()
  // buffs
}

class CombatDataSource extends EventTarget implements DataSource {
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

const src = new GlobalDataSource()
src.items.set('1', { id: '1', name: '测试物品' })
const item = src.items.get('1')
item?.next({ id: '1', name: '测试物品2' })
const item2 = src.items.get('1')
console.log(src, item?.value, item2?.value)
