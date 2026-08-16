import { zStringRequired } from '@IdeaNick/shared/src/zod'
import { z } from 'zod'

export const zGetIdeaTrpcInput = z.object({
  ideaNick: zStringRequired,
})
