import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicEnv = Object.entries(env).reduce((acc, [key, value]) => {
    if (key.startsWith('VITE_')) {
      return {
        ...acc,
        [key]: value,
      }
    }
    return acc
  }, {})
  return {
    plugins: [react(), svgr({})],
    server: {
      port: +env.PORT,
    },
    preview: {
      port: +env.PORT,
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
