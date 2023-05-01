import { ItemRegistry } from 'hedra-engine'
import { ItemTemplateId } from './ItemTemplateId'
import { TomeOfKnowledge } from './common/TomeOfKnowledge'
import { ClothArmor } from './equip/ClothArmor'
import { FireWand } from './equip/FireWand'
import { WoodenSword } from './equip/WoodenSword'

export * from './ItemTemplateId'

export function registerItemTemplates() {
  Object.assign(ItemRegistry, {
    [ItemTemplateId.TomeOfKnowledge]: TomeOfKnowledge,
    [ItemTemplateId.WoodenSword]: WoodenSword,
    [ItemTemplateId.ClothArmor]: ClothArmor,
    [ItemTemplateId.FireWand]: FireWand,
  })

  Object.entries(ItemRegistry).forEach(([templateId, ItemClass]) => {
    ItemClass.templateId = Number(templateId)
  })
}
