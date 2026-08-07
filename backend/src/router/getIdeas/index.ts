import { trpc } from '../../lib/trpc'
// в tRPC не нужно думать об адресе endpoint, об enpoints на бэкенде нужно рассуждать как о неких функциях, которые будем "дёргать" с фронта

// в tRPC всё является процедурами (procedure)
// процедуры бывают 2 типов: query (get) - запрос с сервера - и mutation (post) - отправка чего-либо на сервер, что поменяет его состояние

// в query передаём ту функцию, которая должна быть вызвана, когда мы запросим её с фронта
export const getIdeasTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const ideas = await ctx.prisma.idea.findMany({
    select: {
      id: true,
      nick: true,
      name: true,
      description: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return { ideas }
})
