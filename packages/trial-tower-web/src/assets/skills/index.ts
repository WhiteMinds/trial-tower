import { ComponentProps, FC } from 'react'
import { ReactComponent as IconPhysicalAttack } from './physical_attack.svg'
import { ReactComponent as IconConcentrate } from './concentrate.svg'
import { ReactComponent as IconFastContinuousHit } from './fast_continuous_hit.svg'
import { ReactComponent as IconEnhanceConstitution } from './enhance_constitution.svg'
import { ReactComponent as IconSoulReaper } from './soul_reaper.svg'
import { ReactComponent as IconFireballs } from './fireballs.svg'
import { ReactComponent as IconClayGolem } from './clay_golem.svg'
import { SkillTemplateId } from 'hedra-engine'

export const SkillAssetMap: Record<
  SkillTemplateId,
  FC<ComponentProps<'svg'> & { title?: string }>
> = {
  [SkillTemplateId.Base]: IconPhysicalAttack,
  [SkillTemplateId.PhysicalAttack]: IconPhysicalAttack,
  [SkillTemplateId.Concentrate]: IconConcentrate,
  [SkillTemplateId.FastContinuousHit]: IconFastContinuousHit,
  [SkillTemplateId.EnhanceConstitution]: IconEnhanceConstitution,
  [SkillTemplateId.SoulReaper]: IconSoulReaper,
  [SkillTemplateId.Fireballs]: IconFireballs,
  [SkillTemplateId.ClayGolem]: IconClayGolem,
}
