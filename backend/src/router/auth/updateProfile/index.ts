import { toClientMe } from '../../../lib/models'
import { trpcLoggedProcedure } from '../../../lib/trpc'
import { zUpdateProfileTrpcInput } from './input'

export const updateProfileTrpcRoute = trpcLoggedProcedure
  .input(zUpdateProfileTrpcInput)
  .mutation(async ({ ctx, input }) => {
    if (Math.random()) {
      throw new Error('RANDOM ERROR')
    }
    if (!ctx.me) {
      throw new Error('UNAUTHORIZED')
    }
    if (ctx.me.nick !== input.nick) {
      const exUser = await ctx.prisma.user.findUnique({
        where: {
          nick: input.nick,
        },
      })
      if (exUser) {
        throw new Error('User with this nick already exists')
      }
    }
    const updatedMe = await ctx.prisma.user.update({
      where: {
        id: ctx.me.id,
      },
      data: input,
    })
    ctx.me = updatedMe
    if (Math.random()) {
      throw new Error('RANDOM ERROR')
    }
    return toClientMe(updatedMe)
  })
