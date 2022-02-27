import { Item, TomeOfKnowledge } from './Item'
import { ClothArmor, Equip, WoodenSword } from './Equip'
import { ItemTemplateId } from './ItemTemplateId'

export { Item, Equip }

export const ItemTemplateMap: Record<ItemTemplateId, typeof Item> = {
  [ItemTemplateId.Base]: Item,
  [ItemTemplateId.TomeOfKnowledge]: TomeOfKnowledge,
  [ItemTemplateId.WoodenSword]: WoodenSword,
  [ItemTemplateId.ClothArmor]: ClothArmor,
}

Object.entries(ItemTemplateMap).forEach(([templateId, ItemClass]) => {
  // TODO: 先用 as 顶着
  ItemClass.templateId = Number(templateId) as ItemTemplateId
})
