import { AppContext } from '../lib/ctx'
import { env } from '../lib/env'
import { getPasswordHash } from '../utils/getPasswordHash'

export const presetDb = async (ctx: AppContext) => {
  // находим пользователя с ником admin, если его нет, создаём его, если есть, всё равно обновляем permissions на ALL
  await ctx.prisma.user.upsert({
    where: {
      nick: 'admin',
    },
    create: {
      nick: 'admin',
      email: 'admin@example.com',
      password: getPasswordHash(env.INITIAL_ADMIN_PASSWORD),
      permissions: ['ALL'],
    },
    update: {
      permissions: ['ALL'],
    },
  })
}
