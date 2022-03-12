import * as R from 'ramda'
import { Entity } from '../../model/entity'

export class Team {
  constructor(public members: Entity[]) {}

  contains(entity: Entity): boolean {
    return this.members.includes(entity)
  }

  get isAnyoneAlive() {
    return R.any(R.prop('isAlive'), this.members)
  }
}
