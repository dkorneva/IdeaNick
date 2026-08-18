import { sendEmail } from './utils'

jest.mock('./utils', () => {
  const original = jest.requireActual('./utils')
  // переопределяем только функцию sendEmail
  // в новой реализации просто добавляется ok: true
  const mockedSendEmail: typeof sendEmail = jest.fn(async () => {
    return {
      ok: true,
    }
  })
  return {
    ...original,
    sendEmail: mockedSendEmail,
  }
})
