import { zEmailRequired, zNickRequired, zStringRequired } from '@IdeaNick/shared/src/zod'
import { z } from 'zod'

export const zSignUpTrpcInput = z.object({
  nick: zNickRequired,
  email: zEmailRequired,
  password: zStringRequired,
})
