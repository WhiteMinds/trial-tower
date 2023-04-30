import { Engine } from 'hedra-engine'
import { registerItemTemplate } from './items'

export * from 'hedra-engine'
export * from './items'

registerItemTemplate()

export class TrialTowerEngine extends Engine {
  constructor(...args: ConstructorParameters<typeof Engine>) {
    super(...args)
  }
}
