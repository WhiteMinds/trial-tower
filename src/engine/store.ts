export class Store {
  constructor(public prefix: string = '') {}

  setItem<T = unknown>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data))
  }

  getItem<T = unknown>(key: string): T | null {
    const value = localStorage.getItem(key)
    return value == null ? null : JSON.parse(value)
  }

  updateItem<T = unknown>(key: string, updater: (data: T | null) => T): void {
    this.setItem(key, updater(this.getItem(key)))
  }
}
