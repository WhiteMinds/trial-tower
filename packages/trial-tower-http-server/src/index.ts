import './prepare'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { router } from './route'
import { tokenPlugin } from './route/utils'

const app = express()
app.use(express.json({ limit: '32mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(tokenPlugin)
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)

app.use(morgan('default'))
app.use('/api', router)

const port = process.env.PORT ?? 8085
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
