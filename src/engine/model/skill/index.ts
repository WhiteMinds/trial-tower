import { Concentrate } from './active/Concentrate'
import { FastContinuousHit } from './active/FastContinuousHit'
import { Fireballs } from './active/Fireballs'
import { PhysicalAttack } from './active/PhysicalAttack'
import { EnhanceConstitution } from './passivity/EnhanceConstitution'
import { SoulReaper } from './passivity/SoulReaper'
import { Skill } from './Skill'
import { SkillTemplateId } from './SkillTemplateId'

export { Skill }

export const SkillTemplateMap: Record<SkillTemplateId, typeof Skill> = {
  [SkillTemplateId.Base]: Skill,
  [SkillTemplateId.PhysicalAttack]: PhysicalAttack,
  [SkillTemplateId.Concentrate]: Concentrate,
  [SkillTemplateId.FastContinuousHit]: FastContinuousHit,
  [SkillTemplateId.EnhanceConstitution]: EnhanceConstitution,
  [SkillTemplateId.SoulReaper]: SoulReaper,
  [SkillTemplateId.Fireballs]: Fireballs,
}

Object.entries(SkillTemplateMap).forEach(([templateId, SkillClass]) => {
  // TODO: 先用 as 顶着
  SkillClass.templateId = templateId as SkillTemplateId
})
