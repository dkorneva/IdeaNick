/* eslint-disable @typescript-eslint/no-explicit-any */
import { EOL } from 'os'
import _ from 'lodash'
import pc from 'picocolors'
import { serializeError } from 'serialize-error'
import { MESSAGE } from 'triple-beam'
import winston from 'winston'
import * as yaml from 'yaml'
import { env } from './env'

const baseFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  // хранить стек ошибки - порядок файлов. которые были вызваны до воспроизведения ошибки
  winston.format.errors({ stack: true })
)

const prettyFormat = winston.format((logData) => {
  const setColor = {
    info: (str: string) => pc.blue(str),
    error: (str: string) => pc.red(str),
    debug: (str: string) => pc.cyan(str),
  }[logData.level as 'info' | 'error' | 'debug']

  const levelAndType = `${logData.level} ${logData.logType}`
  const topMessage = `${setColor(levelAndType)} ${pc.green(logData.timestamp as string)}${EOL}${logData.message}`
  // "всё, кроме..."
  const visibleMessageTags = _.omit(logData, ['level', 'logType', 'timestamp', 'message', 'service', 'hostEnv'])

  const stringifyedLogData = _.trim(
    yaml.stringify(visibleMessageTags, (_key, value) => (_.isFunction(value) ? 'Function' : value))
  )

  return {
    ...logData,
    [MESSAGE]:
      [topMessage, Object.keys(visibleMessageTags).length > 0 ? `${EOL}${stringifyedLogData}` : '']
        .filter(Boolean)
        .join('') + EOL,
  }
})()

export const winstonLogger = winston.createLogger({
  level: 'debug',
  format: baseFormat,
  defaultMeta: { service: 'backend', hostEnv: env.HOST_ENV },
  transports: [
    new winston.transports.Console({
      // хранить в формате json
      format: env.HOST_ENV !== 'local' ? winston.format.json() : prettyFormat,
    }),
  ],
})

export const logger = {
  info: (logType: string, message: string, meta?: Record<string, any>) => {
    winstonLogger.info(message, { logType, ...meta })
  },
  error: (logType: string, error: any, meta?: Record<string, any>) => {
    const serializedError = serializeError(error)
    winstonLogger.error(serializedError.message || 'Unknown error', {
      logType,
      error,
      errorStack: serializedError.stack,
      ...meta,
    })
  },
}
