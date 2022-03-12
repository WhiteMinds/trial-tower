import { MainStage } from './stage'
import { Store } from './store'
import { UniqueId } from './types'
import { createUniqueId } from './utils'

export * from './stage'
export * from './model/entity'
export * from './model/combat_log'
export * from './model/item'
export * from './model/skill'
export * from './model/buff'

const StoreKey = {
  Characters: 'Characters',
}

const globalStore = new Store()

export class Engine {
  mainStage: MainStage

  static getCharacters(): Character[] {
    const characters = globalStore.getItem<Character[]>(StoreKey.Characters)
    return characters ?? []
  }

  static createCharacter(data: Omit<Character, 'id'>): Character {
    const character: Character = {
      id: createUniqueId(),
      ...data,
    }
    globalStore.updateItem<Character[]>(StoreKey.Characters, (characters) => {
      characters ??= []
      return [...characters, character]
    })
    return character
  }

  constructor(character: Character) {
    this.mainStage = new MainStage(
      character,
      new Store(`${StoreKey.Characters}/${character.id}/`)
    )
  }

  destroy(): void {
    this.mainStage.saveAllToStore()
  }
}

export interface Character {
  id: UniqueId
  name: string
}
