import { ComponentProps, FC } from 'react'
import { ItemTemplateId } from 'trial-tower-engine'
import { ReactComponent as IconBook } from './book.svg'
import { ReactComponent as IconWand } from './wand.svg'
import { ReactComponent as IconSword } from './sword.svg'
import { ReactComponent as IconClothArmor } from './cloth_armor.svg'

export const ItemAssetMap: Record<ItemTemplateId, FC<ComponentProps<'svg'> & { title?: string }>> = {
  [ItemTemplateId.Base]: IconSword,
  [ItemTemplateId.TomeOfKnowledge]: IconBook,
  [ItemTemplateId.WoodenSword]: IconSword,
  [ItemTemplateId.ClothArmor]: IconClothArmor,
  [ItemTemplateId.FireWand]: IconWand,
}

// TODO: 可能提供 `<ItemIcon item={item}>` 这种形式更好？
