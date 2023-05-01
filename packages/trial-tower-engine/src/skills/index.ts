import { SkillRegistry } from 'hedra-engine'
import { SkillTemplateId } from './SkillTemplateId'
import { ClayGolem } from './active/ClayGolem'
import { Concentrate } from './active/Concentrate'
import { FastContinuousHit } from './active/FastContinuousHit'
import { Fireballs } from './active/Fireballs'
import { PhysicalAttack } from './active/PhysicalAttack'
import { EnhanceConstitution } from './passivity/EnhanceConstitution'
import { SoulReaper } from './passivity/SoulReaper'

export * from './SkillTemplateId'

export function registerSkillTemplates() {
  Object.assign(SkillRegistry, {
    [SkillTemplateId.PhysicalAttack]: PhysicalAttack,
    [SkillTemplateId.Concentrate]: Concentrate,
    [SkillTemplateId.FastContinuousHit]: FastContinuousHit,
    [SkillTemplateId.EnhanceConstitution]: EnhanceConstitution,
    [SkillTemplateId.SoulReaper]: SoulReaper,
    [SkillTemplateId.Fireballs]: Fireballs,
    [SkillTemplateId.ClayGolem]: ClayGolem,
  })

  Object.entries(SkillRegistry).forEach(([templateId, SkillClass]) => {
    SkillClass.templateId = templateId
  })
}
