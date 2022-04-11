import { Router } from 'express'
import { router as userRoutes } from './user'
import { router as gameRoutes } from './game'

const router = Router()

router.use('/users', userRoutes)
router.use('/game', gameRoutes)

export { router }
