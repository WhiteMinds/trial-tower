import { CombatSystem } from '..'

export interface CombatSystemModule {
  init: (system: CombatSystem) => void
}
