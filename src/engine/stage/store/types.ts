import { EpicFactory as GeneralEpicFactory, Action } from '../../utils/RxStore'
import { actionCreators } from '.'
import { StageData } from './StageData'

export type ActionCreators = typeof actionCreators

export type ActionsMap = Action.FromActionCreators<ActionCreators>

export type Actions = ActionsMap[keyof ActionsMap]

export interface CreateOptions {}

export type EpicFactory = GeneralEpicFactory<
  CreateOptions,
  StageData,
  Actions,
  Actions
>
