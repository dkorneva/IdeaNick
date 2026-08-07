import baseConfig from '../eslint.config.js'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pluginReact from 'eslint-plugin-react'

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,

  pluginReact.configs.flat.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json', 'tsconfig.app.json'],
        tsconfigRootDir,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17+ не требует импортировать React
      'no-restricted-syntax': [
        'error',
        {
          selector: '[object.type=MetaProperty][property.name=env]',
          message: 'Use instead import { env } from "lib/env"',
        },
      ],
      //   'jsx-a11y/anchor-is-valid': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          // Запрещаем импорт всего из @ideanick/backend, кроме /input
          patterns: [
            {
              regex: '^@ideanick/backend/(?!(.*/)?input$).+$',
              message: 'Импорт из бэкенда разрешен только для файлов input',
            },
          ],
        },
      ],
    },
  },

  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.js'],
  },

  //   🔹 Специальные настройки для Vite-конфига
  {
    files: ['./vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json', 'tsconfig.app.json'],
        tsconfigRootDir,
      },
    },
  },
]
