import { ErrorRequestHandler, Router } from 'express'
import { router as userRoutes } from './user'
import { router as gameRoutes } from './game'
import { respond } from './utils'

const router = Router()

router.use('/users', userRoutes)
router.use('/game', gameRoutes)

const handle: ErrorRequestHandler = (err: unknown, req, res, next) => {
  console.error(err)
  if (err instanceof Error) {
    respond(res, { error: err.message }).status(500)
    return
  }

  respond(res, { error: String(err) }).status(500)
}
router.use(handle)

export { router }
