import { Action } from '../../../../utils/RxStore'
import { Item } from '../../../types'

export const actionCreators = Action.actionCreators({
  createItem: Action.pp<Item>(),
})
