// eslint-disable-next-line import/order
import { env } from './lib/env'
import { type Server } from 'http'
import cors from 'cors'
import express from 'express'
import { applyCron } from './lib/cron'
import { AppContext, createAppContext } from './lib/ctx'
import { applyPassportToExpressApp } from './lib/passport'
import { applyTrpcToExpressApp } from './lib/trpc'
import { trpcRouter } from './router'
import { presetDb } from './scripts/presetDb'

let server: Server | null = null

void (async () => {
  let ctx: AppContext | null = null

  try {
    ctx = createAppContext()
    await presetDb(ctx)
    const expressApp = express()
    expressApp.use(cors())

    expressApp.get('ping', (req, res) => {
      res.send('pong')
    })
    applyPassportToExpressApp(expressApp, ctx)
    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter)
    applyCron(ctx)
    server = expressApp.listen(env.PORT, () => {
      console.info(`Listening at http://localhost:${env.PORT}`)
    })

    server.on('error', async (error) => {
      console.error(error)
      await ctx?.stop()
      process.exitCode = 1
    })
  } catch (error) {
    console.error(error)
    server?.close()
    await ctx?.stop()
  }
})()
