import { useObservableState } from 'observable-hooks'
import { BehaviorSubject } from 'rxjs'

export function useBehaviorSubject<T>(subject: BehaviorSubject<T>): T {
  return useObservableState(subject, subject.value)
}
