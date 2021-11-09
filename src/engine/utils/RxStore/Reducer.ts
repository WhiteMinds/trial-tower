import * as R from 'ramda'
import { Draft, produce } from 'immer'
import { Action } from './Action'

export type Reducer<S, A extends Action<any, any>, E extends any[]> = (
  prevState: S,
  action: A,
  ...extra: E
) => S

export namespace Reducer {
  export type ImmerReducer<S, A extends Action<any, any>, E extends any[]> = (
    prevState: Draft<S>,
    action: A,
    ...extra: E
  ) => void

  export function compose<S, A extends Action<any, any>, E extends any[]>(
    ...reducers: Reducer<S, A, E>[]
  ): Reducer<S, A, E> {
    reducers = R.reverse(reducers)

    return (prevState, action, ...extra) =>
      reducers.reduce(
        (prevState, reducer) => reducer(prevState, action, ...extra),
        prevState,
      )
  }

  export function handle<
    AMI extends Action.ActionMatcherInput<any, any>,
    S,
    E extends any[]
  >(
    actionMatcherInput: AMI,
    reducer: Reducer<S, Action.FromActionMatcherInput<AMI>, E>,
  ): Reducer<S, Action<any, any>, E> {
    const matcher = Action.getActionMatcher(actionMatcherInput)
    return (prevState, action, ...extra) =>
      matcher(action) ? reducer(prevState, action, ...extra) : prevState
  }

  export function immerHandle<
    AMI extends Action.ActionMatcherInput<any, any>,
    S,
    E extends any[]
  >(
    actionMatcherInput: AMI,
    reducer: ImmerReducer<S, Action.FromActionMatcherInput<AMI>, E>,
  ): Reducer<S, Action<any, any>, E> {
    const matcher = Action.getActionMatcher(actionMatcherInput)
    return (prevState: S, action: Action<any, any>, ...extra: E): S =>
      matcher(action)
        ? produce(prevState, prevState => {
            reducer(prevState, action, ...extra)
          })
        : prevState
  }
}
