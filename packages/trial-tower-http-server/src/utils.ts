import _ from 'lodash'

export function assert(assertion: unknown, msg?: string): asserts assertion {
  if (!assertion) {
    throw new Error(msg)
  }
}

export function assertStringType(
  data: unknown,
  msg?: string
): asserts data is string {
  assert(typeof data === 'string', msg)
}

export function pick<T extends Record<string, any>, U extends keyof T>(
  object: T,
  ...props: U[]
): Pick<T, U> {
  return _.pick(object, ...props)
}

export function omit<T extends Record<string, any>, U extends keyof T>(
  object: T,
  ...props: U[]
): Omit<T, U> {
  return _.omit(object, ...props)
}
