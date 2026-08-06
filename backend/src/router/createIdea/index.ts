// это мутация
// мутация что-то меняет на сервере, query просто забирает что-то с сервера, тем не менее, мутация тоже может возвращать что-то с сервера

import { ideas } from '../../lib/ideas'
import { trpc } from '../../lib/trpc'
import { zCreateIdeaTrpcInput } from './input'

export const createIdeaTrpcRoute = trpc.procedure
  // дублируем проверку с фронта, т.к. не гарантируем, что данные с клиента придут правильные
  .input(zCreateIdeaTrpcInput)
  .mutation(({ input }) => {
    if (ideas.find((idea) => idea.nick === input.nick)) {
      throw new Error('Idea with this nick already exists')
    }
    ideas.unshift(input)
    return true
  })
