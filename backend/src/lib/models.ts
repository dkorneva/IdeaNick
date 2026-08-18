import { pick } from '@IdeaNick/shared/src/pick'
import { type User } from '../generated/prisma/client'

export const toClientMe = (user: User | null) => {
  return user && pick(user, ['id', 'nick', 'name', 'permissions', 'email', 'avatar'])
}
