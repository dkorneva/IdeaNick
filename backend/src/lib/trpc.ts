// // tRPC - фреймворк для создания безопасных к типам (typesafe) API, использующий автодополнение и удалённый вызов процедур
// // Он является посредником между сервером и клиентов, позволяющий им использовать один и тот же маршрутизатор (роутер) для обработки запросов HTTP

// в данном файле всё, что связано с trpc и не является роутами

import { initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { type Express } from 'express'
import { type TrpcRouter } from '../router'

export const trpc = initTRPC.create()

export const applyTrpcToExpressApp = (expressApp: Express, trpcRouter: TrpcRouter) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
    })
  )
}
