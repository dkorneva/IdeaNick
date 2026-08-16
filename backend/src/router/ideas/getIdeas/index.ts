import _ from 'lodash'
import { trpcLoggedProcedure } from '../../../lib/trpc'
import { zGetIdeasTrpcInput } from './input'
// в tRPC не нужно думать об адресе endpoint, об enpoints на бэкенде нужно рассуждать как о неких функциях, которые будем "дёргать" с фронта

// в tRPC всё является процедурами (procedure)
// процедуры бывают 2 типов: query (get) - запрос с сервера - и mutation (post) - отправка чего-либо на сервер, что поменяет его состояние

// в query передаём ту функцию, которая должна быть вызвана, когда мы запросим её с фронта
export const getIdeasTrpcRoute = trpcLoggedProcedure.input(zGetIdeasTrpcInput).query(async ({ ctx, input }) => {
  // const normalizedSearch = input.search ? input.search.trim().replace(/[\s\n\t]/g, '_') : undefined
  const normalizedSearch = input.search ? input.search.trim().replace(/[\s\n\t]/g, ' & ') : undefined
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
    where: {
      blockedAt: null,
      // встроить объект из скобок в текущий объект
      ...(!normalizedSearch
        ? {}
        : {
            OR: [
              {
                name: {
                  search: normalizedSearch,
                },
              },
              {
                description: {
                  search: normalizedSearch,
                },
              },
              {
                text: {
                  search: normalizedSearch,
                },
              },
            ],
          }),
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
