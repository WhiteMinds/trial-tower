import _ from 'lodash'

export function pullSample<T>(collection: Array<T>) {
  if (collection.length === 0) return
  const [item] = _.pullAt(collection, _.random(0, collection.length - 1))
  return item
}
