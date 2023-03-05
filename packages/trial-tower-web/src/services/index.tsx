import { createContext, FC, useContext, useState } from 'react'
import { GameService, getGameService } from './GameService'

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

export function useGameService(): {
  gameSvc: GameService
  mode: 'online' | 'local'
  setMode: (mode: 'online' | 'local') => void
} {
  const { mode, setMode } = useContext(ServiceContext)

  const gameServerSvc = getGameService(mode)

  return { mode, setMode, gameSvc: gameServerSvc }
}
