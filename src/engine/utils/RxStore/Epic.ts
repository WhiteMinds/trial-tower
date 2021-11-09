import { BehaviorSubject, Observable, merge } from 'rxjs'
import { Action } from './Action'

export type Epic<
  S,
  InputAction extends Action<any, any>,
  OutputAction extends Action<any, any>
> = (
  action$: Observable<InputAction>,
  state$: BehaviorSubject<S>,
) => Observable<OutputAction>

export type EpicFactory<
  CreateOptions,
  S,
  InputAction extends Action<any, any>,
  OutputAction extends Action<any, any>
> = (options: CreateOptions) => Epic<S, InputAction, OutputAction>

export function combineEpics<
  S,
  IA extends Action<any, any>,
  OA extends Action<any, any>
>(...epics: Epic<S, IA, OA>[]): Epic<S, IA, OA> {
  return (action$, state$) => merge(...epics.map(e => e(action$, state$)))
}
