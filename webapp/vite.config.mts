import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicEnv = Object.entries(env).reduce((acc, [key, value]) => {
    if (key.startsWith('VITE_') || ['NODE_ENV', 'HOST_ENV', 'SOURCE_VERSION'].includes(key)) {
      return {
        ...acc,
        [key]: value,
      }
    }
    return acc
  }, {})

  if (env.HOST_ENV !== 'local') {
    if (!env.SENTRY_AUTH_TOKEN) {
      throw new Error('SENTRY_AUTH_TOKEN is not defined')
    }
    if (!env.SOURCE_VERSION) {
      throw new Error('SOURCE_VERSION is not defined')
    }
  }

  return {
    plugins: [
      react({}),
      svgr({}),
      !env.SENTRY_AUTH_TOKEN
        ? undefined
        : sentryVitePlugin({
            org: 'ideanick-pf',
            project: 'webapp',
            authToken: env.SENTRY_AUTH_TOKEN,
            release: { name: env.SOURCE_VERSION },
          }),
    ],
    server: {
      port: +env.PORT,
    },
    preview: {
      port: +env.PORT,
    },
    build: {
      sourcemap: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import', 'if-function'],
        },
      },
    },
    define: {
      'process.env': publicEnv,
    },
  }
})
