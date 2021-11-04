import { EventEmitter } from 'eventemitter3'
import { Stage } from './types'

type ObjectManagerEventTypes<T> = {
  ItemAdded: [T]
  ItemDeleted: [T]
}

type ValidId = string

export class ObjectManager<
  T extends { id: ValidId; serialize: () => TData },
  TData
> extends EventEmitter<ObjectManagerEventTypes<T>> {
  protected items = new Map<T['id'], T | null>()

  constructor(
    public ItemClass: {
      new (): T
      unserialize: (data: TData, stage: Stage) => T
    },
    public stage: Stage,
  ) {
    super()
  }

  protected getData(id: T['id']): TData | null {
    return null
  }

  protected setData(id: T['id'], data: TData): void {}

  get(id: T['id']): T | null {
    const isFirstGet = !this.items.has(id)
    if (!isFirstGet) return this.items.get(id) ?? null

    let item: T | null = null
    const data = this.getData(id)
    if (data != null) {
      item = this.ItemClass.unserialize(data, this.stage)
    }

    this.items.set(id, item)
    return item
  }

  add(val: T): void {
    if (this.items.has(val.id)) {
      throw new Error('Try add item but existed')
    }

    this.items.set(val.id, val)
    this.emit('ItemAdded', val)
  }

  del(val: T): void {
    if (!this.items.has(val.id)) {
      throw new Error('Try delete item but not existed')
    }

    this.items.delete(val.id)
    this.emit('ItemDeleted', val)
  }
}

export class ObjectManager$InitWithStore<
  T extends { id: ValidId; serialize: () => TData },
  TData
> extends ObjectManager<T, TData> {
  constructor(
    ItemClass: { new (): T; unserialize: (data: TData, src: Stage) => T },
    src: Stage,
    private prefixInStoreKey: string,
  ) {
    super(ItemClass, src)
  }

  protected getData(id: T['id']): TData | null {
    const json = localStorage.getItem(`${this.prefixInStoreKey}/` + id)
    if (json == null) return null

    return JSON.parse(json) as TData
  }

  protected setData(id: T['id'], data: TData): void {
    localStorage.setItem(`${this.prefixInStoreKey}/` + id, JSON.stringify(data))
  }
}

// 这个类主要是实现从来源拷贝一份数据使用
export class ObjectManager$InitWithCopy<
  T extends { id: ValidId; serialize: () => TData },
  TData
> extends ObjectManager<T, TData> {
  constructor(src: Stage, private copySrc: ObjectManager<T, TData>) {
    super(copySrc.ItemClass, src)
  }

  protected getData(id: T['id']): TData | null {
    return this.copySrc.get(id)?.serialize() ?? null
  }

  protected setData(id: T['id'], data: TData): void {}
}
