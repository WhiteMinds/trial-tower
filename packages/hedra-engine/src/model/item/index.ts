import { Item } from './Item'
import { Equip, EquipSlot } from './Equip'
// TODO: 必须声明为类型导出，否则 web 编译报错，可能是 vite 的问题，待排查
import type { EquipRequired } from './Equip'

export { Item, Equip, EquipSlot, EquipRequired }

type TemplateId = number
// TODO: 这里之后要完善成 ItemRegistry.add 的形式，不应该直接暴露出数据。
// TODO: 要改成一个 engine 对应一个 registry，不应该是全局的。并且还要考虑到多个 engine 共享、复用通一个 registry 的情况。
export const ItemRegistry: Record<TemplateId, typeof Item> = {}
