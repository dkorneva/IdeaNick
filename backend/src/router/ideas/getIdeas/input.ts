import { z } from 'zod'

export const zGetIdeasTrpcInput = z.object({
  // cursor - идентификатор последней загруженной записи, при передаче курсора буду загружаться все записи после указанного курсора
  // corce означает, что можно передать и строку, и число, но они в итоге будут приведены к числу
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
})
