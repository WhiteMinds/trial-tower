import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, scan } from 'rxjs/operators'
import { cloneBehaivorSubject } from '../rxjs'
import { Action } from './Action'
import { Epic } from './Epic'
import { Reducer } from './Reducer'
import { logStateAction } from './redux-devtools-extension'

export interface Store<S, A extends Action<any, any>> {
  /** 用来发布 action */
  dispatch: (action: A) => void

  /** 用来订阅状态更新 */
  state$: BehaviorSubject<S>

  /** 在 state$ 更新后才会 emit action ，用来处理副作用 */
  action$: Observable<A>

  registerEpic(epic: Epic<S, A, A>): () => void
}

export namespace Store {
  export function createStore<S, A extends Action<any, any>, E extends any[]>(
    name: string,
    initialState: S,
    reducer: Reducer<S, A, E>,
    ...extra: E
  ): Store<S, A> {
    /**
     * 这个 createStore 现在是自己用 rxjs 简单实现了一下，因为感觉引入 redux 没什么必要，
     * 用不到它的那些中间件什么的设施。等后面我们有需要用到的时候，因为 action, reducer,
     * store 的 API 基本是和 redux 兼容的，所以我们可以很简单地替换掉这个函数的实现
     */

    const action$ = new Subject<A>()

    const forEffectAction$ = new Subject<A>()

    const state$ = new BehaviorSubject(initialState)

    const dispatch: Store<S, A>['dispatch'] = action => {
      action$.next(action)

      // 等 state$ 更新完
      forEffectAction$.next(action)
    }

    const registerEpic: Store<S, A>['registerEpic'] = epic => {
      const readonlyAction$ = forEffectAction$.pipe()
      const [readonlyState$, cleanupSubscribed] = cloneBehaivorSubject(state$)
      const ob = epic(readonlyAction$, readonlyState$)
      const sub = ob.subscribe(dispatch)
      return () => {
        sub.unsubscribe()
        cleanupSubscribed()
      }
    }

    action$
      .pipe(scan(reduceState, initialState), distinctUntilChanged())
      .subscribe(state$)

    return {
      dispatch,
      state$,
      action$: forEffectAction$.pipe(),
      registerEpic,
    }

    function reduceState(currState: S, action: A): S {
      const nextState = reducer(currState, action, ...extra)
      logStateAction(name, {
        actionType: action.type,
        action: action,
        state: currState,
      })
      return nextState
    }
  }
}
