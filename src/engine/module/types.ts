import { Engine } from '..'

export interface EngineModule {
  init: (engine: Engine) => void
}
