import { sharedEnv } from './env'

// возвращаем во фронтенд читаемую часть пути - оригинальное название файла, который загрузил пользователь
export const getS3UploadName = (path: string) => {
  const filename = path.replace(/^.*[\\/]/, '')
  const parts = filename.split('-')
  parts.shift()
  return parts.join('-')
}

export const getS3UploadUrl = (s3Key: string) => {
  return `${sharedEnv.S3_URL}/ideanickws/${s3Key}`
}
