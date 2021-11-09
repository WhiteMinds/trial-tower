// from https://github.com/LeetCode-OpenSource/ayanami/blob/master/src/redux-devtools-extension.ts
// redux devtools 接口文档：https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md

import { noop } from 'lodash'
import { SyntheticEvent } from 'react'

// 因为最早是从 ayanami 这个库复制过来的，所以保留了这个名字作为致敬 XD
// 后面要改可以改，无所谓
const STORE_NAME = 'Ayanami'

interface DevTools {
  send(action: { type: string }, state?: Partial<GlobalState>): void
  init(state: GlobalState): void
}

interface GlobalState {
  [modelName: string]: Record<string, unknown>
}

const FakeReduxDevTools = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connect: (config: Record<string, unknown>) => ({ send: noop, init: noop }),
}

const ReduxDevTools =
  (typeof window !== 'undefined' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__) ||
  FakeReduxDevTools

const STATE: GlobalState = {}

const getDevTools = (() => {
  let devTools: DevTools

  return (): DevTools => {
    if (!devTools) {
      devTools = ReduxDevTools.connect({ name: STORE_NAME })
      devTools.init({})
    }
    return devTools
  }
})()

const isNeedLogToConsole = location.href.includes('$$__logStore')
let isNeedLogToDevTools = true

export function enableReduxLog(): void {
  isNeedLogToDevTools = true
}

export function disableReduxLog(): void {
  isNeedLogToDevTools = false
}

export function logStateAction(
  namespace: string,
  infos: { actionType: string; action: any; state?: any },
): void {
  const action = {
    type: `${namespace}/${infos.actionType}`,
    params: filterParams(infos.action),
  }

  const prevState = { ...STATE }
  if (infos.state) {
    STATE[namespace] = infos.state
  }
  const currState = { ...STATE }

  if (isNeedLogToDevTools) {
    getDevTools().send(action, STATE)
  }

  if (isNeedLogToConsole) {
    console.groupCollapsed('RxStore', action.type)
    console.log(action.type, 'action', action)
    console.log(action.type, 'prev state', prevState)
    console.log(action.type, 'curr state', currState)
    console.groupEnd()
  }
}

function filterParams<T>(params: T | Event | SyntheticEvent): T | string {
  if (params && typeof params === 'object') {
    if (params instanceof Event) {
      return `<<Event:${params.type}>>`
    } else if (isSyntheticEvent(params)) {
      return `<<SyntheticEvent:${params.nativeEvent.type}>>`
    }
  }

  return params

  function isSyntheticEvent(input: any): input is SyntheticEvent {
    return 'nativeEvent' in input && input.nativeEvent instanceof Event
  }
}
