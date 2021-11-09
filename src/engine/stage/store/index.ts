import { combineEpics, Reducer, Store } from '../../utils/RxStore'
import { StageData as StageData } from './StageData'
import type { CreateOptions, Actions, EpicFactory } from './types'
import { actionCreators as ticketChangedActionCreators } from './packs/entity/actions'
import { reducer as ticketChangedReducer } from './packs/entity/reducers'
import { epic as entityEpic } from './packs/entity/epics'

export type { ActionCreators, ActionsMap, Actions } from './types'

export const actionCreators = {
  ...ticketChangedActionCreators,
}

const epic: EpicFactory = (options) => combineEpics(entityEpic(options))

const reducer = Reducer.compose(ticketChangedReducer)

export type StageStore = ReturnType<typeof createStageStore>

export function createStageStore(
  options: CreateOptions,
): Store<StageData, Actions> {
  const store = Store.createStore('Stage', StageData.initial, reducer)
  store.registerEpic(epic(options))
  return store
}
