import { config } from 'dotenv'

process.on('unhandledRejection', (reason, promise) => console.error(reason))
process.on('uncaughtException', (err) => console.error(err))

config()
// TODO: configureLogger('server.log')
