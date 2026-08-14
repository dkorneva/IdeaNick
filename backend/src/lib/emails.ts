import { promises as fs } from 'fs'
import path from 'path'
import { getNewIdeaRoute } from '@IdeaNick/webapp/src/lib/routes'
import fg from 'fast-glob'
import Handlebars from 'handlebars'
import _ from 'lodash'
import { type Idea, type User } from '../generated/prisma/client'
import { sendEmailThroughBrevo } from './brevo'
import { env } from './env'

// memoize: когда в первый раз вызываем функцию getHtmlTemplates, вызовется async функция и вернёт htmlTemplates, но во все последующие вызовы она вернёт закешированный результат выполнения этой функции
const getHbrTemplates = _.memoize(async () => {
  const htmlPathsPattern = path.resolve(__dirname, '../emails/dist')
  const htmlPaths = fg.sync([`${htmlPathsPattern.replace(/\\/g, '/')}/*.html`])
  const hbrTemplates: Record<string, HandlebarsTemplateDelegate> = {}
  for (const htmlPath of htmlPaths) {
    const templateName = path.basename(htmlPath, '.html')
    const htmlTemplate = await fs.readFile(htmlPath, 'utf8')
    hbrTemplates[templateName] = Handlebars.compile(htmlTemplate)
  }
  return hbrTemplates
})

const getEmailHtml = async (templateName: string, templateVariables: Record<string, string> = {}) => {
  const hbrTemplates = await getHbrTemplates()
  const hbrTemplate = hbrTemplates[templateName]
  // получаем html с подставленными переменными
  const html = hbrTemplate(templateVariables)
  return html
}

const sendEmail = async ({
  to,
  subject,
  templateName,
  templateVariables = {},
}: {
  to: string
  subject: string
  templateName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateVariables?: Record<string, any>
}) => {
  try {
    const fullTemplateVariables = {
      ...templateVariables,
      homeUrl: env.WEBAPP_URL,
    }
    const html = await getEmailHtml(templateName, fullTemplateVariables)
    const { loggableResponse } = await sendEmailThroughBrevo({ to, html, subject })
    console.info('sendEmail', {
      to,
      templateName,
      templateVariables,
      response: loggableResponse,
    })
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false }
  }
}

export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: `${getNewIdeaRoute({ abs: true })}`,
    },
  })
}

export const sendIdeaBlockedEmail = async ({ user, idea }: { user: Pick<User, 'email'>; idea: Pick<Idea, 'nick'> }) => {
  return await sendEmail({
    to: user.email,
    subject: 'Your Idea Blocked!',
    templateName: 'ideaBlocked',
    templateVariables: {
      ideaNick: idea.nick,
    },
  })
}
