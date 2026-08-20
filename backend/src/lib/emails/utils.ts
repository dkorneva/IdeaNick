import { env } from '../env'
import { promises as fs } from 'fs'
import path from 'path'
import fg from 'fast-glob'
import Handlebars from 'handlebars'
import _ from 'lodash'
import { sendEmailThroughBrevo } from '../brevo'
import { logger } from '../logger'

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

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateVariables = {},
}: {
  to: string | string[]
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
    logger.info('email', 'sendEmail', {
      to,
      templateName,
      templateVariables,
      response: loggableResponse,
    })
    return { ok: true }
  } catch (error) {
    logger.error('email', error, {
      to,
      templateName,
      templateVariables,
    })
    return { ok: false }
  }
}
