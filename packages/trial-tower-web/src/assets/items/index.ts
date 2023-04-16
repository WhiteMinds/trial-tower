import { ComponentProps, FC } from 'react'
import { ReactComponent as IconBook } from './book.svg'
import { ReactComponent as IconWand } from './wand.svg'
import { ReactComponent as IconSword } from './sword.svg'
import { ReactComponent as IconClothArmor } from './cloth_armor.svg'
// TODO: 这个东西应该由更高级的封装提供（比如基于引擎封装出试炼之塔游戏），目前先放在引擎，并直接在前端使用
import { ItemTemplateId } from 'hedra-engine'

export const ItemAssetMap: Record<ItemTemplateId, FC<ComponentProps<'svg'> & { title?: string }>> = {
  [ItemTemplateId.Base]: IconSword,
  [ItemTemplateId.TomeOfKnowledge]: IconBook,
  [ItemTemplateId.WoodenSword]: IconSword,
  [ItemTemplateId.ClothArmor]: IconClothArmor,
  [ItemTemplateId.FireWand]: IconWand,
}

// TODO: 可能提供 `<ItemIcon item={item}>` 这种形式更好？
