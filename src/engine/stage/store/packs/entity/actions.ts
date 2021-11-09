import { Action } from '../../../../utils/RxStore'
import { Entity } from '../../../types'

export const actionCreators = Action.actionCreators({
  createEntity: Action.pp<Entity>(),
  entityOnHit: Action.pp<{
    entityId: string
    damage: number
  }>(),
})
