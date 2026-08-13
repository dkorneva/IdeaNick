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
      'react/react-in-jsx-scope': 'off', // React 17+ does not require importing React.
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
          // Restrict backend imports to input files and utils/can.
          patterns: [
            {
              group: [
                '@IdeaNick/backend/**',
                '!@IdeaNick/backend/**/',
                '!@IdeaNick/backend/**/input',
                '!@IdeaNick/backend/src/utils/can',
              ],
              message: 'Backend imports are allowed only for input files and utils/can',
            },
          ],
        },
      ],
    },
  },

  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.js'],
  },

  // Special settings for the Vite config.
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
