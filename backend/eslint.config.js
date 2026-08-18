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
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'node/no-process-env': 'error',
      'no-console': ['error'],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '{.,..}/**/test/integration',
              group: 'builtin',
              position: 'before',
            },
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
            orderImportKind: 'asc',
          },
        },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/**/!(*.integration.test.ts)',
              from: './src/test',
              message: 'Import something from test dir only inside integration tests',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.js'],
  },
]
