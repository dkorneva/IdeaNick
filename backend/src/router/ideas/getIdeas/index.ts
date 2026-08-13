import _ from 'lodash'
import { trpc } from '../../../lib/trpc'
import { zGetIdeasTrpcInput } from './input'
// в tRPC не нужно думать об адресе endpoint, об enpoints на бэкенде нужно рассуждать как о неких функциях, которые будем "дёргать" с фронта

// в tRPC всё является процедурами (procedure)
// процедуры бывают 2 типов: query (get) - запрос с сервера - и mutation (post) - отправка чего-либо на сервер, что поменяет его состояние

// в query передаём ту функцию, которая должна быть вызвана, когда мы запросим её с фронта
export const getIdeasTrpcRoute = trpc.procedure.input(zGetIdeasTrpcInput).query(async ({ ctx, input }) => {
  const rawIdeas = await ctx.prisma.idea.findMany({
    select: {
      id: true,
      nick: true,
      name: true,
      description: true,
      serialNumber: true,
      // _count - возможность в prisma запросить количество связанных сущностей в select
      _count: {
        select: {
          ideasLikes: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        serialNumber: 'desc',
      },
    ],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    // количество записей, которое нужно взять
    take: input.limit + 1,
  })
  const nextIdea = rawIdeas.at(input.limit)
  const nextCursor = nextIdea?.serialNumber
  const rawIdeasExceptNext = rawIdeas.slice(0, input.limit)
  const ideasExceptNext = rawIdeasExceptNext.map((idea) => ({
    ..._.omit(idea, ['_count']),
    likesCount: idea._count.ideasLikes,
  }))

  return { ideas: ideasExceptNext, nextCursor }
})
