import type { TrpcRouter } from '@IdeaNick/backend/src/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import type { ReactNode } from 'react'

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

// trpcClient должен знать, где endpoint для всех trpc роутов
const trpcClient = trpc.createClient({
  links: [
    // httpsBatchLink нужен, чтобы если одновременно вызвано несколько query, он соединит их все в одну и получится один запрос
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
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
