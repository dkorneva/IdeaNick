// tRPC - фреймворк для создания безопасных к типам (typesafe) API, использующий автодополнение и удалённый вызов процедур
// Он является посредником между сервером и клиентов, позволяющий им использовать один и тот же маршрутизатор (роутер) для обработки запросов HTTP

import { initTRPC } from '@trpc/server'

const ideas = [
  {
    nick: 'cool-idea-nick-1',
    name: 'Idea 1',
    description: 'Idea 1 description...',
  },
  {
    nick: 'cool-idea-nick-2',
    name: 'Idea 2',
    description: 'Idea 2 description...',
  },
  {
    nick: 'cool-idea-nick-3',
    name: 'Idea 3',
    description: 'Idea 3 description...',
  },
  {
    nick: 'cool-idea-nick-4',
    name: 'Idea 4',
    description: 'Idea 4 description...',
  },
  {
    nick: 'cool-idea-nick-5',
    name: 'Idea 5',
    description: 'Idea 5 description...',
  },
]

const trpc = initTRPC.create()

export const trpcRouter = trpc.router({
  // в tRPC не нужно думать об адресе endpoint, об enpoints на бэкенде нужно рассуждать как о неких функциях, которые будем "дёргать" с фронта

  // в tRPC всё является процедурами (procedure)
  // процедуры бывают 2 типов: query (get) - запрос с сервера - и mutation (post) - отправка чего-либо на сервер, что поменяет его состояние

  // в query передаём ту функцию, которая должна быть вызвана, когда мы запросим её с фронта
  getIdeas: trpc.procedure.query(() => {
    return { ideas }
  }),
})

// на бэкенде этот тип не нужен, он нужен на фронтенде, чтобы синхронизировать типы
export type TrpcRouter = typeof trpcRouter
