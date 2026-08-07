import { type Request } from 'express'
import { type User } from '../generated/prisma/client'

export type ExpressRequest = Request & {
  user: User | undefined
}
