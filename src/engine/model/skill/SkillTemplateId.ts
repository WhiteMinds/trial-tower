// 单独放一个文件而不是在 index.ts 中，是为了防止循环引用

export enum SkillTemplateId {
  Base = 'Base',
  PhysicalAttack = 'PhysicalAttack',
  Concentrate = 'Concentrate',
  FastContinuousHit = 'FastContinuousHit',
  EnhanceConstitution = 'EnhanceConstitution',
}
