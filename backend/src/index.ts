// eslint-disable-next-line import/order
import debug from 'debug'
import { type Server } from 'http'
import cors from 'cors'
import express from 'express'
import { logger } from '../src/lib/logger'
import { applyCron } from './lib/cron'
import { AppContext, createAppContext } from './lib/ctx'
import { env } from './lib/env'
import { applyPassportToExpressApp } from './lib/passport'
import { applyTrpcToExpressApp } from './lib/trpc'
import { trpcRouter } from './router'
import { presetDb } from './scripts/presetDb'
let server: Server | null = null

void (async () => {
  let ctx: AppContext | null = null

  try {
    debug.enable(env.DEBUG)
    ctx = createAppContext()
    await presetDb(ctx)
    const expressApp = express()
    expressApp.use(cors())

    expressApp.get('/ping', (req, res) => {
      res.send('pong')
    })
    applyPassportToExpressApp(expressApp, ctx)
    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter)
    applyCron(ctx)
    expressApp.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('express', error)
      // если предыдущая middleware уже отправила запрос на сервер
      if (res.headersSent) {
        next(error)
        return
      }
      res.status(500).send('Internal server error')
    })
    server = expressApp.listen(env.PORT, () => {
      logger.info('express', `Listening at http://localhost:${env.PORT}`)
    })
    throw new Error('Error with sourcemap 2')
  } catch (error) {
    logger.error('app', error)
    server?.close()
    await ctx?.stop()
  }
})()
