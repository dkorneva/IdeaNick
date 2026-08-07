// это мутация
// мутация что-то меняет на сервере, query просто забирает что-то с сервера, тем не менее, мутация тоже может возвращать что-то с сервера
import { trpc } from '../../lib/trpc'
import { zCreateIdeaTrpcInput } from './input'

export const createIdeaTrpcRoute = trpc.procedure
  // дублируем проверку с фронта, т.к. не гарантируем, что данные с клиента придут правильные
  .input(zCreateIdeaTrpcInput)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new Error('UNAUTHORIZED')
    }
    const exIdea = await ctx.prisma.idea.findUnique({
      where: {
        nick: input.nick,
      },
    })
    if (exIdea) {
      throw new Error('Idea with this nick already exists')
    }
    await ctx.prisma.idea.create({
      data: { ...input, authorId: ctx.me.id },
    })
    return true
  })
