import _ from 'lodash'
import { type User } from '../generated/prisma/client'

export const toClientMe = (user: User | null) => {
  return user && _.pick(user, ['id', 'nick', 'name', 'permissions', 'email'])
}
