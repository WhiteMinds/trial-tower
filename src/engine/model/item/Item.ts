import { UniqueId } from '../../types'
import { createUniqueId } from '../../utils'

export class Item {
  id: UniqueId = createUniqueId()
}
