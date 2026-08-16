import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

export const createAppContext = () => {
  const adapter = new PrismaPg({
    // eslint-disable-next-line node/no-process-env
    connectionString: process.env.DATABASE_URL,
  })

  const prisma = new PrismaClient({ adapter })

  return {
    prisma,
    stop: async () => {
      await prisma.$disconnect()
    },
  }
}

export type AppContext = ReturnType<typeof createAppContext>
