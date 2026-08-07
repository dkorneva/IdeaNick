// // tRPC - фреймворк для создания безопасных к типам (typesafe) API, использующий автодополнение и удалённый вызов процедур
// // Он является посредником между сервером и клиентов, позволяющий им использовать один и тот же маршрутизатор (роутер) для обработки запросов HTTP

// в данном файле всё, что связано с trpc и не является роутами

import { initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { type Express } from 'express'
import superjson from 'superjson'
import { expressHandler } from 'trpc-playground/handlers/express'
import { type TrpcRouter } from '../router'
import type { AppContext } from './ctx'

export const trpc = initTRPC.context<AppContext>().create({
  transformer: superjson,
})

export const applyTrpcToExpressApp = async (expressApp: Express, appContext: AppContext, trpcRouter: TrpcRouter) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: () => appContext,
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
