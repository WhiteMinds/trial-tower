/**
 * 这里要做成多种实现，然后用 DI 看情况提供不同的实现的单例出去
 */
import * as Hedra from 'hedra-engine'
import axios, { AxiosInstance, AxiosStatic } from 'axios'
import { assert } from '../../utils'
import { Character, GameServerService } from './types'

const baseReq = axios.create({
  baseURL: 'http://localhost:8085/api',
  headers: { 'Content-Type': 'application/json' },
}) as AxiosStatic

type ResponseData<T> =
  | { payload: T }
  | {
      error: string
      displayMsg?: string
    }

interface User {
  id: number
  createdAt: Date
  updatedAt: Date
  username: string
}

export class HttpGameServerService implements GameServerService {
  token?: string
  req: AxiosInstance

  // 目前还没有 Character.Snapshot 所以先直接用这个类型了
  character?: Character

  constructor() {
    this.req = baseReq
  }

  async register(username: string, password: string) {
    const { data } = await this.req.post<
      ResponseData<{ user: User; token: string }>
    >('/users', {
      username,
      password,
    })
    assertNoError(data)
    return data.payload
  }

  async auth(username: string, password: string) {
    const { data } = await this.req.post<
      ResponseData<{ user: User; token: string }>
    >('/users/auth', {
      username,
      password,
    })
    assertNoError(data)
    this.token = data.payload.token
    this.req = baseReq.create({
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    })
    return data.payload
  }

  async createCharacter(name: string) {
    const { data } = await this.req.post<ResponseData<Character>>(
      '/game/characters',
      {
        name,
      }
    )
    assertNoError(data)
    return data.payload
  }

  async getCharacters() {
    const { data } = await this.req.get<ResponseData<Character[]>>(
      '/game/characters'
    )
    assertNoError(data)
    return data.payload
  }

  async createRandomCombat() {
    assert(this.character)
    const { data } = await this.req.post<
      ResponseData<{
        combatLogs: Hedra.CombatLog[]
        player: Hedra.Entity.Snapshot
      }>
    >('/game/combats', {
      characterId: this.character.id,
    })
    assertNoError(data)
    return data.payload
  }

  async useItem(itemId: Hedra.Item['id']) {
    assert(this.character)
    const { data } = await this.req.post<
      ResponseData<{
        success: boolean
        player: Hedra.Entity.Snapshot
      }>
    >(`/game/items/${itemId}/use`, {
      characterId: this.character.id,
    })
    assertNoError(data)
    return data.payload
  }
}

function assertNoError<T>(
  data: ResponseData<T>
): asserts data is { payload: T } {
  if ('error' in data) {
    throw new Error(data.displayMsg ?? data.error)
  }
}

export const httpGameServerService = new HttpGameServerService()
