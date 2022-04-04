// import { Engine } from 'hedra-engine'
import { Router } from 'express'
import { router as userRoutes } from './user'

const router = Router()

router.use('/users', userRoutes)

export { router }
