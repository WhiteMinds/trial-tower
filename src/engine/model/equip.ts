import { AttrModifier } from './entity'

export interface Equip {
  id: number
  name: string

  maxHP?: AttrModifier
  atk?: AttrModifier
}
