import { EventEmitter } from 'eventemitter3'
import { DataSource } from './types'

type DataManagerEventTypes<T> = {
  ItemAdded: [T]
  ItemDeleted: [T]
}

type ValidId = string

export class DataManager<
  T extends { id: ValidId; serialize: () => TData },
  TData
> extends EventEmitter<DataManagerEventTypes<T>> {
  protected items = new Map<T['id'], T>()

  constructor(
    private ItemClass: {
      new (): T
      unserialize: (data: TData, src: DataSource) => T
    },
    public src: DataSource,
  ) {
    super()
  }

  protected getData(id: T['id']): TData | null {
    return null
  }

  protected setData(id: T['id'], data: TData): void {}

  get(id: T['id']): T | null {
    let item = this.items.get(id)

    if (!item) {
      const data = this.getData(id)
      if (data) {
        item = this.ItemClass.unserialize(data, this.src)
        this.items.set(id, item)
      }
    }

    return item ?? null
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

export class DataManager$InitWithStore<
  T extends { id: ValidId; serialize: () => TData },
  TData
> extends DataManager<T, TData> {
  constructor(
    ItemClass: { new (): T; unserialize: (data: TData, src: DataSource) => T },
    src: DataSource,
  ) {
    super(ItemClass, src)
  }

  protected getData(id: T['id']): TData | null {
    const json = localStorage.getItem(id)
    if (json == null) return null

    return JSON.parse(json) as TData
  }

  protected setData(id: T['id'], data: TData): void {
    localStorage.setItem(id, JSON.stringify(data))
  }
}

// 这个类主要是实现从来源拷贝一份数据使用
export class DataManager$InitWithCopy<
  T extends { id: ValidId; serialize: () => TData },
  TData
> extends DataManager<T, TData> {
  constructor(
    ItemClass: { new (): T; unserialize: (data: TData, src: DataSource) => T },
    src: DataSource,
    private copySrc: DataManager<T, TData>,
  ) {
    super(ItemClass, src)
  }

  protected getData(id: T['id']): TData | null {
    return this.copySrc.get(id)?.serialize() ?? null
  }

  protected setData(id: T['id'], data: TData): void {}
}
