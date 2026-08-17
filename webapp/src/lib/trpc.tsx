// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { TrpcRouter } from '@IdeaNick/backend/src/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink, type TRPCLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { observable } from '@trpc/server/observable'
import Cookies from 'js-cookie'
import type { ReactNode } from 'react'
import superjson from 'superjson'
import { env } from './env'
import { sentryCaptureException } from './sentry'

export const trpc = createTRPCReact<TrpcRouter>()

// queryClient управляет логикой запроса, а не типами
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false /* перезапрашивать запрос, если возникла ошибка */,
      refetchOnWindowFocus: false /* если фокус курсора сместился с окна, а потом опять сфокусировался на нём, перезапросить данные (предполагается, что данные могут устареть) */,
    },
  },
})

const customTrpcLink: TRPCLink<TrpcRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(error) {
          if (!error.data?.isExpected) {
            sentryCaptureException(error)
            if (env.NODE_ENV !== 'development') {
              console.error(error)
            }
          }
          observer.error(error)
        },
        complete() {
          observer.complete()
        },
      })
      return unsubscribe
    })
  }
}

// trpcClient должен знать, где endpoint для всех trpc роутов
const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    // httpBatchLink нужен, чтобы если одновременно вызвано несколько query, он соединит их все в одну и получится один запрос
    customTrpcLink,
    loggerLink({
      enabled: () => env.NODE_ENV === 'development',
    }),
    httpBatchLink({
      url: env.VITE_BACKEND_TRPC_URL,

      headers: () => {
        const token = Cookies.get('token')
        return {
          ...(token && { authorization: `Bearer ${token}` }),
        }
      },
    }),
  ],
})

export const TrpcProvider = ({ children }: { children: ReactNode }) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
