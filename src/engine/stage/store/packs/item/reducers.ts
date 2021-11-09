import { Action, Reducer } from '../../../../utils/RxStore'
import { actionCreators } from './actions'
import { StageData } from '../../StageData'

const createReducer = Reducer.immerHandle(
  Action.oneOf([actionCreators.createItem]),
  (data: StageData, { payload: item }) => {
    data.items[item.id] = item
    console.log('create', item)
  },
)

export const reducer = Reducer.compose(createReducer)
