import { UniqueId } from './types'
import { v4 as uuid } from 'uuid'

export function createUniqueId(): UniqueId {
  return uuid()
}
