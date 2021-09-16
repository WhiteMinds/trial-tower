import { EventEmitter } from 'eventemitter3'
import { BehaviorSubject } from 'rxjs'

type DataManagerEventTypes<T> = {
  ItemAdded: [T]
  ItemUpdate: [T]
}

export class DataManager<T extends { id: unknown }> extends EventEmitter<
  DataManagerEventTypes<T>
> {
  protected data = new Map<T['id'], T>()
  private subs = new Map<T['id'], BehaviorSubject<T>>()

  get(id: T['id']): T | null {
    const item = this.data.get(id)
    return item ?? null
  }

  sub(id: T['id']): BehaviorSubject<T> | null {
    const sub = this.subs.get(id)
    if (sub) return sub
    const item = this.data.get(id)
    if (!item) return null

    const subject = new BehaviorSubject(item)
    // subject.subscribe((val) => this.data.set(id, val))
    this.subs.set(id, subject)

    return subject
  }

  set(id: T['id'], val: T): void {
    this.data.set(id, val)
    this.subs.get(id)?.next(val)
    this.emit('ItemUpdate', val)
  }

  add(val: T): void {
    if (this.data.has(val.id)) {
      throw new Error('Try add item but existed')
    }

    this.set(val.id, val)
    this.emit('ItemAdded', val)
  }

  getPrimaryData() {
    return this.data
  }
}
