import { Request, Response } from 'express'
import expressJWT from 'express-jwt'
import jwt from 'jsonwebtoken'
import { User } from '../model'

// TODO: 没有提供 JWT_KEY 应该给出警告
const JWT_KEY = process.env.JWT_KEY ?? 'DEFAULT_JWT_KEY'
const TokenPayloadKeyInRequest = 'tokenData' as const
type TokenPayloadKeyInRequest = typeof TokenPayloadKeyInRequest

interface TokenPayload {
  id: User['id']
}

export const tokenPlugin = expressJWT({
  secret: JWT_KEY,
  algorithms: ['HS256'],
  userProperty: TokenPayloadKeyInRequest,
})
  // TODO: 这样设计不太好，但是先这么糊着以后再调整
  .unless({ path: ['/api/users', '/api/users/auth'], method: 'POST' })

export function createToken(data: TokenPayload): string {
  return jwt.sign(data, JWT_KEY, {
    algorithm: 'HS256',
  })
}

export function getTokenPayload<T extends Request>(req: T): TokenPayload {
  if (!hasTokenPayload(req)) {
    throw new Error('[getTokenPayload] Cant find token payload key in request')
  }

  return req[TokenPayloadKeyInRequest]
}

function hasTokenPayload<T extends Request>(
  req: T
): req is T & { [TokenPayloadKeyInRequest]: TokenPayload } {
  return TokenPayloadKeyInRequest in req
}

type ResponseData<T> =
  | { payload: T }
  | {
      error: string
      displayMsg?: string
    }

export function respond<T>(res: Response, data: ResponseData<T>) {
  return res.json(data)
}
