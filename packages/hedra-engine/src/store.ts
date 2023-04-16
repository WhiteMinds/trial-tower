import { Character } from './index'

export interface Store<K = number | string> {
  createData<T extends { id?: K }>(data: T): Promise<T & { id: K }>
  setData<T extends { id: K }>(key: K, data: T): Promise<void>
  getData<T extends { id: K }>(key: K): Promise<T | null>
  updateData<T extends { id: K }>(key: K, updater: (data: T | null) => T): Promise<void>

  createCharacter(data: Omit<Character, 'id'>): Promise<Character>
  setCharacter(key: Character['id'], data: Character): Promise<void>
  getCharacter(key: Character['id']): Promise<Character | null>
  updateCharacter(key: Character['id'], updater: (data: Character | null) => Character): Promise<void>
}
