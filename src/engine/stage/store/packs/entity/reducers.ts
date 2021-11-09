import { Action, Reducer } from '../../../../utils/RxStore'
import { actionCreators } from './actions'
import { StageData } from '../../StageData'

const testReducer = Reducer.immerHandle(
  Action.oneOf([actionCreators.entityOnHit]),
  (data: StageData, { payload: { entityId } }) => {
    console.log('id', entityId, data.entities[entityId])
  },
)

export const reducer = Reducer.compose(testReducer)
