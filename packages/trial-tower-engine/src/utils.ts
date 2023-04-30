import { v4 as uuid } from 'uuid'
import { UniqueId } from './types'

export function createUniqueId(): UniqueId {
  return uuid()
}

export function equalUniqueId(value1: UniqueId, value2: UniqueId): boolean {
  return value1 == value2
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
