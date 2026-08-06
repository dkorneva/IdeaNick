import { trpc } from '../lib/trpc'
import { getIdeaTrpcRoute } from './getIdea'
import { getIdeasTrpcRoute } from './getIdeas'

export const trpcRouter = trpc.router({
  getIdea: getIdeaTrpcRoute,
  getIdeas: getIdeasTrpcRoute,
})

// на бэкенде этот тип не нужен, он нужен на фронтенде, чтобы синхронизировать типы
export type TrpcRouter = typeof trpcRouter
