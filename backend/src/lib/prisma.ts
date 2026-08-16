import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { env } from './env'
import { logger } from './logger'

export const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  })

  const prisma = new PrismaClient({
    adapter,
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'info',
      },
    ],
  })
  prisma.$on('query', (e) => {
    logger.info('prisma:low:query', 'Successfull request', {
      query: e.query,
      duration: e.duration,
      params: env.HOST_ENV === 'local' ? e.params : '***',
    })
  })
  prisma.$on('info', (e) => {
    logger.info('prisma:low:info', e.message)
  })

  const extendedPrisma = prisma.$extends({
    client: {},
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          const start = Date.now()
          try {
            const result = await query(args)
            const durationMs = Date.now() - start
            logger.info('prisma:high', 'Successfull request', { model, operation, args, durationMs })
            return result
          } catch (error) {
            const durationMs = Date.now() - start
            logger.error('prisma:high', error, { model, operation, args, durationMs })
            throw error
          }
        },
      },
    },
  })
  return extendedPrisma
}
