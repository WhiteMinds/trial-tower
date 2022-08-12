import * as Hedra from 'hedra-engine'

export interface GameServerService {
  character?: Character
  createCharacter(name: string): Promise<Character>
  getCharacters(): Promise<Character[]>
  createRandomCombat(): Promise<{
    combatLogs: Hedra.CombatLog[]
    player: Hedra.Entity.Snapshot
  }>
  useItem(itemId: Hedra.Item['id']): Promise<{
    success: boolean
    player: Hedra.Entity.Snapshot
  }>
}

export interface Character extends Hedra.Character {
  entity: Hedra.Entity.Snapshot
}
