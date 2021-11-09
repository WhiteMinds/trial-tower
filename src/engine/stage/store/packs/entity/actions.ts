import { Action } from '../../../../utils/RxStore'

export const actionCreators = Action.actionCreators({
  entityOnHit: Action.pp<{
    entityId: string
    damage: number
  }>(),
})
