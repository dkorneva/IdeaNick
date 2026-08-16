import baseConfig from '../eslint.config.js'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import node from 'eslint-plugin-node'

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,

  {
    files: ['**/*.{ts,js}'],
    plugins: {
      node,
    },
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir,
      },
    },
    rules: {
      'node/no-process-env': 'error',
      'no-console': ['error'],
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.js'],
  },
]
