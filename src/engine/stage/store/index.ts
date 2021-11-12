import { combineEpics, Reducer, Store } from '../../utils/RxStore'
import { CombatStageData, StageData as StageData } from './StageData'
import type { CreateOptions, Actions, EpicFactory } from './types'
import { actionCreators as entityActionCreators } from './packs/entity/actions'
import { reducer as entityReducer } from './packs/entity/reducers'
import { actionCreators as itemActionCreators } from './packs/item/actions'
import { reducer as itemReducer } from './packs/item/reducers'
// import { epic as entityEpic } from './packs/entity/epics'

export type { ActionCreators, ActionsMap, Actions } from './types'

export const actionCreators = {
  ...entityActionCreators,
  ...itemActionCreators,
}

const epic: EpicFactory = (options) => combineEpics()

const reducer = Reducer.compose(entityReducer, itemReducer)

export type StageStore = ReturnType<typeof createStageStore>

export function createStageStore(
  options: CreateOptions,
): Store<StageData, Actions> {
  const store = Store.createStore(
    'Stage',
    options.defaultState ?? StageData.initial,
    reducer,
  )
  store.registerEpic(epic(options))
  return store
}

export function createCombatStageStore(
  options: CreateOptions,
): Store<CombatStageData, Actions> {
  const store = Store.createStore<CombatStageData, Actions, any[]>(
    'CombatStage',
    {
      ...CombatStageData.initial,
      ...options.defaultState,
    },
    reducer,
  )
  store.registerEpic(epic(options))
  return store
}
