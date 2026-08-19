/* eslint-disable node/no-process-env */
const s3Url = process.env.VITE_S3_URL || process.env.S3_URL

// возвращаем во фронтенд читаемую часть пути - оригинальное название файла, который загрузил пользователь
export const getS3UploadName = (path: string) => {
  const filename = path.replace(/^.*[\\/]/, '')
  const parts = filename.split('-')
  parts.shift()
  return parts.join('-')
}

export const getS3UploadUrl = (s3Key: string) => {
  return `${s3Url}/ideanickws/${s3Key}`
}
