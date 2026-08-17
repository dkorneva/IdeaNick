/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
  verbose: true,
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  transformIgnorePatterns: [
    '<rootDir>/../node_modules/.pnpm/(?!(superjson|copy-anything|is-what)@)',
    'node_modules/(?!.pnpm|superjson|copy-anything|is-what)',
  ],
}
