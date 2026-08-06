import { z } from 'zod'
import { trpc } from '../../lib/trpc'

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
    const idea = await ctx.prisma.idea.findUnique({
      where: {
        nick: input.ideaNick,
      },
    })

    return { idea }
  })
