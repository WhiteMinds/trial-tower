import { GameServerService } from './types'
import { localGameServerService } from './LocalGameServerService'
import { httpGameServerService } from './HttpGameServerService'

export * from './types'
export { HttpGameServerService } from './HttpGameServerService'

export function getGameServerService(
  mode: 'local' | 'online'
): GameServerService {
  return mode === 'local' ? localGameServerService : httpGameServerService
}
