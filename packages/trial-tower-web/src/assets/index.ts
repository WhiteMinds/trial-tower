import { Item, Skill } from 'trial-tower-engine'
import { ItemAssetMap } from './items'
import { SkillAssetMap } from './skills'

export function getItemAssetComp(item: Item.Snapshot) {
  return ItemAssetMap[item.templateId]
}

export function getSkillAssetComp(skill: Skill.Snapshot) {
  return SkillAssetMap[skill.templateId]
}
