import { promises as fs } from 'fs'
import path from 'path'
import fg from 'fast-glob'
import _ from 'lodash'
import { type Idea, type User } from '../generated/prisma/client'
import { env } from './env'

// memoize: когда в первый раз вызываем функцию getHtmlTemplates, вызовется async функция и вернёт htmlTemplates, но во все последующие вызовы она вернёт закешированный результат выполнения этой функции
const getHtmlTemplates = _.memoize(async () => {
  const htmlPathsPattern = path.resolve(__dirname, '../emails/dist')
  const htmlPaths = fg.sync([`${htmlPathsPattern.replace(/\\/g, '/')}/*.html`])
  const htmlTemplates: Record<string, string> = {}
  for (const htmlPath of htmlPaths) {
    const templateName = path.basename(htmlPath, '.html')
    htmlTemplates[templateName] = await fs.readFile(htmlPath, 'utf8')
  }
  return htmlTemplates
})

const getHtmlTemplate = async (templateName: string) => {
  const htmlTemplates = await getHtmlTemplates()
  return htmlTemplates[templateName]
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
    const htmlTemplate = await getHtmlTemplate(templateName)
    const fullTemplateVariables = {
      ...templateVariables,
      homeUrl: env.WEBAPP_URL,
    }
    console.info('sendEmail', {
      to,
      subject,
      templateName,
      fullTemplateVariables,
      htmlTemplate,
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
      addIdeaUrl: `${env.WEBAPP_URL}/ideas/new`,
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
