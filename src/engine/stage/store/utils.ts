import { Actions, ActionsMap } from './types'
import { actionCreators as commonActionCreators } from './actionCreators'

/**
 * 判断传入的 action 是否会导致 Cache 里任意一个 ticket 数据发生改变
 */
export function actionMayChangeTicket(
  action: Actions,
): action is
  | ActionsMap['deleted']
  | ActionsMap['currentAccountKicked']
  | ActionsMap['receiveFromServerEvent'] {
  return (
    commonActionCreators.deleted.match(action) ||
    commonActionCreators.currentAccountKicked.match(action) ||
    commonActionCreators.receiveFromServerEvent.match(action)
  )
}
