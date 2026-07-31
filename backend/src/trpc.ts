// tRPC - фреймворк для создания безопасных к типам (typesafe) API, использующий автодополнение и удалённый вызов процедур
// Он является посредником между сервером и клиентов, позволяющий им использовать один и тот же маршрутизатор (роутер) для обработки запросов HTTP

import { initTRPC } from '@trpc/server'
// lodash позволяет генерировать фейковый контент
import _ from 'lodash'
import { z } from 'zod'

// const ideas = [
//   {
//     nick: 'cool-idea-nick-1',
//     name: 'Idea 1',
//     description: 'Idea 1 description...',
//   },
//   {
//     nick: 'cool-idea-nick-2',
//     name: 'Idea 2',
//     description: 'Idea 2 description...',
//   },
//   {
//     nick: 'cool-idea-nick-3',
//     name: 'Idea 3',
//     description: 'Idea 3 description...',
//   },
//   {
//     nick: 'cool-idea-nick-4',
//     name: 'Idea 4',
//     description: 'Idea 4 description...',
//   },
//   {
//     nick: 'cool-idea-nick-5',
//     name: 'Idea 5',
//     description: 'Idea 5 description...',
//   },
// ]

// круглые скобки () заменяют конструкцию с return
const ideas = _.times(100, (i) => ({
  nick: `cool-idea-nick-${i}`,
  name: `Idea ${i}`,
  description: `Description of idea ${i}...`,
  text: _.times(100, (j) => `<p>Text paragraph ${j} of idea ${i}...</p>`).join(''),
}))

const trpc = initTRPC.create()

export const trpcRouter = trpc.router({
  // в tRPC не нужно думать об адресе endpoint, об enpoints на бэкенде нужно рассуждать как о неких функциях, которые будем "дёргать" с фронта

  // в tRPC всё является процедурами (procedure)
  // процедуры бывают 2 типов: query (get) - запрос с сервера - и mutation (post) - отправка чего-либо на сервер, что поменяет его состояние

  // в query передаём ту функцию, которая должна быть вызвана, когда мы запросим её с фронта
  getIdeas: trpc.procedure.query(() => {
    return { ideas: ideas.map((idea) => _.pick(idea, ['nick', 'name', 'description'])) }
  }),
  // задача: с фронта передавать на бэкенд ник идеи
  // чтобы процедура принимала входные параметры, необходимо использовать input()
  // в input передаётся zod схема
  // zod позволяет одновременно валидировать и типизировать данные
  // в input должен приходить объект, в котором хранится ideaNick, в котором хранится строка
  getIdea: trpc.procedure
    .input(
      z.object({
        ideaNick: z.string(),
      })
    )
    .query(({ input }) => {
      const idea = ideas.find((idea) => idea.nick === input.ideaNick)
      return { idea: idea || null }
    }),
})

// на бэкенде этот тип не нужен, он нужен на фронтенде, чтобы синхронизировать типы
export type TrpcRouter = typeof trpcRouter
