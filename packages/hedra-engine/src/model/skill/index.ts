import { Skill } from './Skill'

export { Skill }

type TemplateId = number | string
// TODO: 这里之后要完善成 registry.add 的形式，不应该直接暴露出数据。
// TODO: 要改成一个 engine 对应一个 registry，不应该是全局的。并且还要考虑到多个 engine 共享、复用通一个 registry 的情况。
export const SkillRegistry: Record<TemplateId, typeof Skill> = {}
