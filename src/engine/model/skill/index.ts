import { Concentrate } from './active/Concentrate'
import { FastContinuousHit } from './active/FastContinuousHit'
import { PhysicalAttack } from './active/PhysicalAttack'
import { Skill } from './Skill'

export { Skill }

export enum SkillTemplateId {
  Base = 'Base',
  PhysicalAttack = 'PhysicalAttack',
  Concentrate = 'Concentrate',
  FastContinuousHit = 'FastContinuousHit',
}

export const SkillTemplateMap: Record<SkillTemplateId, typeof Skill> = {
  [SkillTemplateId.Base]: Skill,
  [SkillTemplateId.PhysicalAttack]: PhysicalAttack,
  [SkillTemplateId.Concentrate]: Concentrate,
  [SkillTemplateId.FastContinuousHit]: FastContinuousHit,
}
