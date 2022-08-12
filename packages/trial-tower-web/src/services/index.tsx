import { createContext, FC, useContext, useState } from 'react'
import { GameServerService, getGameServerService } from './GameServerService'

function createDefaultContextValue<T>(contextName: string): T {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(`${contextName} must wrapped by provider`)
      },
    }
  ) as T
}

export const ServiceContext = createContext<{
  mode: 'online' | 'local'
  setMode: (mode: 'online' | 'local') => void
}>(createDefaultContextValue('ServiceContext'))

export const ServiceContextProvider: FC = (props) => {
  const [mode, setMode] = useState<'online' | 'local'>('online')
  return (
    <ServiceContext.Provider
      value={{
        mode,
        setMode,
      }}
    >
      {props.children}
    </ServiceContext.Provider>
  )
}

export function useGameServerService(): {
  gameServerSvc: GameServerService
  mode: 'online' | 'local'
  setMode: (mode: 'online' | 'local') => void
} {
  const { mode, setMode } = useContext(ServiceContext)

  const gameServerSvc = getGameServerService(mode)

  return { mode, setMode, gameServerSvc }
}
