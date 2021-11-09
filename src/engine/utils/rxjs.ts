import { BehaviorSubject } from 'rxjs'

/**
 * @categroy rxjs observable
 */
export function cloneBehaivorSubject<T>(
  bs: BehaviorSubject<T>,
): [clonedBehaviorSubject: BehaviorSubject<T>, cleanupSubscribed: () => void] {
  const newBs = new BehaviorSubject(bs.value)
  const sub = bs.subscribe(newBs)
  return [newBs, sub.unsubscribe.bind(sub)]
}
