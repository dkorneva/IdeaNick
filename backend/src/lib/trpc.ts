// // tRPC - фреймворк для создания безопасных к типам (typesafe) API, использующий автодополнение и удалённый вызов процедур
// // Он является посредником между сервером и клиентов, позволяющий им использовать один и тот же маршрутизатор (роутер) для обработки запросов HTTP

// в данном файле всё, что связано с trpc и не является роутами

import { type inferAsyncReturnType, initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { type Express } from 'express'
import superjson from 'superjson'
import { expressHandler } from 'trpc-playground/handlers/express'
import { type TrpcRouter } from '../router'
import type { ExpressRequest } from '../utils/types'
import type { AppContext } from './ctx'
import { logger } from './logger'

const getCreateTrpcContext =
  (appContext: AppContext) =>
  ({ req }: trpcExpress.CreateExpressContextOptions) => ({
    ...appContext,
    me: (req as ExpressRequest).user || null,
  })

type TrpcContext = inferAsyncReturnType<ReturnType<typeof getCreateTrpcContext>>

const trpc = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
})

export const createTrpcRouter = trpc.router

// middleware - нечто, что произойдёт до вызова основной процедуры, там можно прописать всевозможные логики, в т.ч. логику логгирования
// mutation - это грубо говоря конечная часть процедуры, но можно задать и конечную, для этого и используется use

export const trpcLoggedProcedure = trpc.procedure.use(
  // path - путь к процедуре, вызванной в данный момент времени
  // next - функция, которую нужно вызвать, чтобы процедура пошла дальше
  trpc.middleware(async ({ path, type, next, ctx, rawInput }) => {
    const start = Date.now()
    const result = await next()
    const durationMs = Date.now() - start
    const meta = {
      path,
      type,
      userId: ctx.me?.id || null,
      durationMs,
      rawInput: rawInput || null,
    }
    if (result.ok) {
      logger.info(`trpc:${type}:success`, 'Successfull request', { ...meta, output: result.data })
    } else {
      logger.error(`trpc:${type}:error`, result.error, meta)
    }
    return result
  })
)

export const applyTrpcToExpressApp = async (expressApp: Express, appContext: AppContext, trpcRouter: TrpcRouter) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: getCreateTrpcContext(appContext),
    })
  )

  expressApp.use(
    '/trpc-playground',
    await expressHandler({
      trpcApiEndpoint: '/trpc',
      playgroundEndpoint: 'trpc-playground',
      router: trpcRouter,
      request: {
        superjson: true,
      },
    })
  )
}
