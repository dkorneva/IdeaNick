import { cloudinaryUploadTypes } from '@IdeaNick/shared/src/cloudinary'
import { getKeysAsArray } from '@IdeaNick/shared/src/getKeysAsArray'
import { z } from 'zod'

export const zPrepareCloudinaryUploadTrpcInput = z.object({
  type: z.enum(getKeysAsArray(cloudinaryUploadTypes)),
})
