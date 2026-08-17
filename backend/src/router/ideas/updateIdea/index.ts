import { ExpectedError } from '../../../lib/error'
import { trpcLoggedProcedure } from '../../../lib/trpc'
import { canEditIdea } from '../../../utils/can'
import { zUpdateIdeaTrpcInput } from './input'

export const updateIdeaTrpcRoute = trpcLoggedProcedure.input(zUpdateIdeaTrpcInput).mutation(async ({ ctx, input }) => {
  const { ideaId, ...ideaInput } = input
  if (!ctx.me) {
    throw new Error('UNAUTHORIZED')
  }

  const idea = await ctx.prisma.idea.findUnique({
    where: {
      id: ideaId,
    },
  })
  if (!idea) {
    throw new Error('NOT_FOUND')
  }
  // запрет на редактирование текущим пользователем, если он не является автором идеи
  if (!canEditIdea(ctx.me, idea)) {
    throw new Error('NOT_YOUR_IDEA')
  }
  // проверка: пользователь изменил идею - поменял ник, ник нужно проверить на уникальность в системе
  if (idea.nick !== input.nick) {
    const exIdea = await ctx.prisma.idea.findUnique({
      where: {
        nick: input.nick,
      },
    })
    if (exIdea) {
      throw new ExpectedError('Idea with this nick already exists')
    }
  }
  await ctx.prisma.idea.update({
    where: {
      id: ideaId,
    },
    data: {
      ...ideaInput,
    },
  })
  return true
})
