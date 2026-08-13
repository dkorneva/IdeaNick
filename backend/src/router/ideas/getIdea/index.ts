import _ from 'lodash'
import { z } from 'zod'
import { trpc } from '../../../lib/trpc'

// задача: с фронта передавать на бэкенд ник идеи
// чтобы процедура принимала входные параметры, необходимо использовать input()
// в input передаётся zod схема
// zod позволяет одновременно валидировать и типизировать данные
// в input должен приходить объект, в котором хранится ideaNick, в котором хранится строка
export const getIdeaTrpcRoute = trpc.procedure
  .input(
    z.object({
      ideaNick: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const rawIdea = await ctx.prisma.idea.findUnique({
      where: {
        nick: input.ideaNick,
      },
      include: {
        author: {
          select: {
            id: true,
            nick: true,
            name: true,
          },
        },
        // запрашиваем связаннные ideasLikes, запрашиваем id, ищем только те, где userId === ctx.me.id (наш id текущего пользователя)

        // название поля (ideasLikes) определяется названием связи в schema.prisma
        ideasLikes: {
          select: {
            id: true,
          },
          where: {
            userId: ctx.me?.id,
          },
        },
        // суммарное количество лайков у идеи, выбираем, что будем считать ideasLikes
        _count: {
          select: {
            ideasLikes: true,
          },
        },
      },
    })
    if (rawIdea?.blockedAt) {
      throw new Error('Idea is blocked by administrator')
    }
    const isLikedByMe = !!rawIdea?.ideasLikes.length
    const likesCount = rawIdea?._count.ideasLikes || 0
    const idea = rawIdea && { ..._.omit(rawIdea, ['ideasLikes', '_count']), isLikedByMe, likesCount }

    return { idea }
  })
