import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

// refine - переопределение правила для одного конкретного элемента
const zNonemptyTrimmed = z.string().trim().min(1)
const zNonemptyTrimmedRequiredOnNotLocal = zNonemptyTrimmed
  .optional()
  // eslint-disable-next-line node/no-process-env
  .refine((val) => process.env.HOST_ENV === 'local' || !!val, 'Required on local host')

const zEnv = z.object({
  PORT: zNonemptyTrimmed,
  HOST_ENV: z.enum(['local', 'production']),
  DATABASE_URL: zNonemptyTrimmed,
  JWT_SECRET: zNonemptyTrimmed,
  PASSWORD_SALT: zNonemptyTrimmed,
  INITIAL_ADMIN_PASSWORD: zNonemptyTrimmed,
  WEBAPP_URL: zNonemptyTrimmed,
  BREVO_API_KEY: zNonemptyTrimmedRequiredOnNotLocal,
  FROM_EMAIL_NAME: zNonemptyTrimmed,
  FROM_EMAIL_ADDRESS: zNonemptyTrimmed,
})

// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(process.env)
