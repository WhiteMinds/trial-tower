import { filter, map, tap } from 'rxjs/operators'
import { EpicFactory } from '../../types'
import { actionMayChangeTicket } from '../../utils'
import { actionCreators } from '../../actionCreators'
import {
  TicketUpdateInfo,
  actionCreators as selfActionCreators,
} from './actions'
import { TicketChangeReason } from '@/services/TicketService'

const ticketChangedEpic: EpicFactory = () => (action$, state$) => {
  let {
    tickets: prevTickets,
    ticketDocumentIds: prevTicketDocumentIds,
  } = state$.value

  return action$.pipe(
    filter(actionMayChangeTicket),
    map((action): TicketUpdateInfo[] => {
      if (actionCreators.currentAccountKicked.match(action)) {
        return [
          {
            id: action.payload.ticketId,
            updatedAt: new Date().toJSON(),
            triggeredByAccountId: action.payload.triggerAccountId,
            reason: ['_currentAccountKicked'],
          },
        ]
      }

      if (actionCreators.deleted.match(action)) {
        const ticket = state$.value.tickets[action.payload.ticketId]
        if (!ticket) return []
        return [
          {
            id: action.payload.ticketId,
            updatedAt: ticket.updatedAt,
            triggeredByAccountId: action.payload.triggerAccountId,
            reason: ['status'],
          },
        ]
      }

      if (actionCreators.receiveFromServerEvent.match(action)) {
        const { ticket } = action.payload
        let { reason } = action.payload

        const ticketDocumentId = state$.value.ticketDocumentIds[ticket.id]

        // **NOTE**:
        //
        // 如果是当前 tab 修改的任务内容，这个逻辑判断是不会为真的，因为我们会先触发
        // updatedDetailed action，这个 action 也会更新 state.ticketDocumentIds（
        // 然后再更新这里的 prevTicketDocumentIds）
        //
        // **WARNING**:
        //
        // 这个代码有一些需要注意的地方，prevTicketDocumentIds （也就是
        // cacheStore 的 state.ticketDocumentIds）默认是什么 documentId 都没有
        // 的，只有调用 getDetailed 或者请求更新任务详情接口以后，才会有对应的
        // documentId
        //
        // 这里的判断有一个前提，认为需要用到 reason:document 的代码都会先调一
        // 次 getDetailed 。否则就有可能出现后端向前端推送任务信息后，虽然
        // documentId 实际上没有变，但因为我们之前的 documentId 是 undefined ，
        // 所以我们以为它变了的情况
        if (
          /**
           * 当任务内容发生更新时，后端会推送两条 update_group_meta 消息。第一条消息什么
           * reason 也没有，documentId 也会是老的版本；第二条会有 reason `['_some',
           * '_documentMayChanged']`，documentId 也是新的（具体原因请参考 `./reducers`
           * 文件里 `receiveFromServerEventReducer` 里的注释
           *
           * 前端在更新完任务后，会立刻把更新后的 documentId 放到缓存里。同时，上面提到的两
           * 条消息中的第一条也会被前端过滤掉，documentId 不会被放进缓存
           *
           * 为了避免出现下面这种情况，导致弹出不必要的提醒：
           *
           * 前端更新任务 -> 前端马上更新缓存 ->
           * 前端收到带有老的 documentId 的事件 -> 前端对比事件里老的 documentId 和缓存
           * 里新的 documentId ，以为发生了修改，展示一个提醒
           *
           * 在这里，我们需要跳过没有 _documentMayChanged 的后端事件
           *
           * https://workspace.jianguoyun.com/task/tickets/dL8dgpPtj6PprgH6Z64TGOawQwcLXpVIRDZ2tKM_5xM=
           */
          action.payload.reason.includes('_documentMayChanged') &&
          prevTicketDocumentIds[ticket.id] !== ticketDocumentId
        ) {
          reason = reason.concat('document')
        }

        const prevTicket = prevTickets[ticket.id]
        if (prevTicket) {
          reason = reason.concat(
            ...TicketChangeReason.getChangedReasons(prevTicket, ticket),
          )
        }

        if (!reason.length) return []

        return [TicketUpdateInfo.createByTicket(ticket, undefined, reason)]
      }

      return []
    }),
    tap(() => {
      const state = state$.value
      prevTickets = state.tickets
      prevTicketDocumentIds = state.ticketDocumentIds
    }),
    filter(infos => Boolean(infos.length)),
    map(infos => selfActionCreators.ticketChanged({ infos })),
  )
}

export const epic = ticketChangedEpic
