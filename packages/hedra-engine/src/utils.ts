import { UniqueId } from './types'
import { v4 as uuid } from 'uuid'

export function createUniqueId(): UniqueId {
  return uuid()
}

export const BooleanT =
  <T>() =>
  (a: T | '' | 0 | 0n | false | null | undefined | void): a is T => {
    return Boolean(a)
  }

export function assert(assertion: unknown, msg?: string): asserts assertion {
  if (!assertion) {
    throw new Error(msg)
  }
}
