import { Entity } from './model/entity'
import { MainStage } from './stage'
import { Store } from './store'
import { UniqueId } from './types'

export * from './stage'
export * from './store'
export * from './model/entity'
export * from './model/combat_log'
export * from './model/item'
export * from './model/skill'
export * from './model/buff'

export class Engine {
  mainStage: MainStage

  constructor(private store: Store) {
    this.mainStage = new MainStage(store)
  }

  // loadedCharacters

  async createCharacter(
    data: Omit<Character, 'id' | 'entityId'>,
    entityCreator: (stage: MainStage) => Promise<Entity>
  ): Promise<Character> {
    const entity = await entityCreator(this.mainStage)
    const character = await this.store.createCharacter({
      entityId: entity.id,
      ...data,
    })
    return character
  }

  async getCharacter(id: Character['id']): Promise<Character | null> {
    return this.store.getCharacter(id)
  }

  destroy(): void {
    this.mainStage.saveAllToStore()
  }
}

export interface Character {
  id: UniqueId
  entityId: UniqueId
  // name、level 等 entity 属性应该和 entity 同步，放在这里主要是性能优化？
  name: string
}
