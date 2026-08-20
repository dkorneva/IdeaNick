import { env } from './env'
import https from 'https'
import { pick } from '@IdeaNick/shared/src/pick'
import axios, { type AxiosResponse } from 'axios'

const brevoHttpsAgent = new https.Agent({
  keepAlive: false,
})

const isRetryableNetworkError = (error: unknown) => {
  return axios.isAxiosError(error) && ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(error.code || '')
}

const makeRequestToBrevo = async ({
  path,
  data,
}: {
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}): Promise<{
  originalResonse?: AxiosResponse
  loggableResponse: Pick<AxiosResponse, 'status' | 'statusText' | 'data'>
}> => {
  if (!env.BREVO_API_KEY) {
    return {
      loggableResponse: {
        status: 200,
        statusText: 'OK',
        data: { message: 'BREVO_API_KEY is not set' },
      },
    }
  }
  let response: AxiosResponse | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await axios({
        method: 'POST',
        url: `https://api.brevo.com/v3/${path}`,
        timeout: 15_000,
        httpsAgent: brevoHttpsAgent,
        headers: {
          accept: 'application/json',
          'api-key': env.BREVO_API_KEY,
          'content-type': 'application/json',
          connection: 'close',
        },
        data,
      })
      break
    } catch (error) {
      if (!isRetryableNetworkError(error) || attempt === 3) {
        throw error
      }
    }
  }
  if (!response) {
    throw new Error('Brevo request failed without response')
  }
  return {
    originalResonse: response,
    loggableResponse: pick(response, ['status', 'statusText', 'data']),
  }
}

export const sendEmailThroughBrevo = async ({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) => {
  const recipients = Array.isArray(to) ? to : [to]
  return await makeRequestToBrevo({
    path: 'smtp/email',
    data: {
      subject,
      htmlContent: html,
      sender: { email: env.FROM_EMAIL_ADDRESS, name: env.FROM_EMAIL_NAME },
      to: recipients.map((email) => ({ email })),
    },
  })
}
