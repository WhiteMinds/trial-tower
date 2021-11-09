import { MainStage } from './stage/MainStage'
import { Entity } from './stage/types'

// export class Engine extends EventTarget {
//   entitySubjects = {
//     init: new Subject<Entity>(),
//     beforeAttack: new Subject<{
//       combat: CombatSystem
//       entity: BattlingEntity
//       damage: number
//     }>(),
//     beforeDamage: new Subject<{
//       combat: CombatSystem
//       entity: BattlingEntity
//       damage: number
//     }>(),
//   }
//   // 需要使用 entitySubjects 的 module 应该在其下方初始化，否则会拿不到
//   equipModule = new EquipModule(this)

//   combat(...teams: Team[]) {
//     const sys = new CombatSystem(...teams)
//     return sys.start()
//   }
// }

// player = PlayerHandler(player).hit(target, 10)
// player.hp -= 10; player.onUpdate('hp')
// player = { ...player, hp: player.hp - 10 }

// 数据库中的 player、item 数据应该是经由事件（action，如 hit、destroy）来触发变化的。
// PlayerHandler 层只是事件的 emitter，大部分事件处理函数都将再次触发事件，只有最底层的几个事件会改变数据。
// 比较底层的事件是由 DataSource 提供。

// 存储时为 GlobalDataSource 全量序列化一次

// GlobalDataSource 的 add 和一些接口应该都是 private 的，他们不会触发事件，
// 公开出去 create、destroy 等接口用来执行这两个函数并调用事件，使用 sub 和 get 来获取数据

// 一些可确认的事情：
// 1. 数据存档一定是全量存取的
//    那么两个数据源直接的克隆是否算一次全量存取？

// 按照内外系统流通设计，内部流通的数据只在最外层做转换，那么内部流通的数据用什么形式

// class EntityHandler {
//   constructor(
//     public src: DataSource,
//     public entity$: BehaviorSubject<Entity>,
//   ) {}

//   update(updater: (now: Entity) => void): void {
//     this.src.entities.set(this.id, produce(this.entity$.value, updater))
//   }

//   onHit(damage: number) {
//     this.update((entity) => {
//       entity.hp -= damage
//     })
//   }

//   get id() {
//     return this.entity$.value.id
//   }

//   get name() {
//     return this.entity$.value.name
//   }
// }

// const src = new GlobalDataSource()
// const item = Item.create(src, { name: '测试物品' })
// const entity = Entity.create(src, { name: '测试实例' })
// entity.items.push(item)

// console.log('entity', entity, src)
// src.entities.add({
//   id: 'e1',
//   name: '测试实例',
//   attrPoint: 1,
//   strength: 1,
//   constitution: 1,
//   hp: 10,
//   maxHP: 10,
// })

// const entity$ = src.entities.sub('e1')!
// const entityHandler = new EntityHandler(src, entity$)
// console.log('e1', entity$.value)
// entityHandler.onHit(5)
// console.log('e1', entity$.value)
// const item = src.items.sub('1')
// item?.next({ id: '1', name: '测试物品2' })
// const item2 = src.items.get('1')
// console.log(src, item?.value, item2?.value)

const mainStage = new MainStage()
const entity = Entity.create(mainStage, { name: '测试实例' })
