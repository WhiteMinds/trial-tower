import { AttrModifier } from '../model/entity'

export interface Equip {
  id: number
  name: string

  maxHP?: AttrModifier
  atk?: AttrModifier
}
