import { PhysicalAttack } from './active/PhysicalAttack'
import { Skill } from './Skill'

export { Skill }

export enum SkillTemplateId {
  Base = 'Base',
  PhysicalAttack = 'PhysicalAttack',
}

export const SkillTemplateMap: Record<SkillTemplateId, typeof Skill> = {
  [SkillTemplateId.Base]: Skill,
  [SkillTemplateId.PhysicalAttack]: PhysicalAttack,
}
