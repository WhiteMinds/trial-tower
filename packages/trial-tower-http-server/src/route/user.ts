import { Router } from 'express'
import { UniqueConstraintError } from 'sequelize'
import { createUser, getUser, getUserByAuth } from '../controller/user'
import { assert, assertStringType } from '../utils'
import { createToken, getTokenPayload, respond } from './utils'

export const router = Router()

router.route('/').post(async (req, res, next) => {
  const { username, password } = req.body ?? {}
  assertStringType(username, 'param wrong')
  assertStringType(password, 'param wrong')
  // TODO: regexp verify
  assert(username.length <= 16 && password.length <= 16, 'param wrong')

  try {
    const user = await createUser(username, password)
    respond(res, {
      payload: {
        token: createToken({ id: user.id }),
        user: user.toJSON(),
      },
    }).status(201)
  } catch (err) {
    if (err instanceof UniqueConstraintError && 'username' in err.fields) {
      respond(res, { error: 'param wrong', displayMsg: '用户名重复' })
      return
    }
    throw err
  }
})

router.route('/auth').post(async (req, res) => {
  const { username, password } = req.body ?? {}
  assertStringType(username, 'param wrong')
  assertStringType(password, 'param wrong')
  // TODO: regexp verify
  assert(username.length <= 16 && password.length <= 16, 'param wrong')

  const user = await getUserByAuth(username, password)
  if (user === null) {
    respond(res, { error: 'cant match', displayMsg: '无匹配的用户' })
      // 感觉怪怪的，auth 作为一个 createToken 的资源这里是不是应该返回 401？
      .status(404)
  } else {
    respond(res, {
      payload: {
        token: createToken({ id: user.id }),
        user: user.toJSON(),
      },
    })
  }
})

router.route('/me').get(async (req, res) => {
  const payload = getTokenPayload(req)
  const user = await getUser(payload.id)
  assert(user)

  respond(res, {
    payload: user.toClient(),
  })
})
