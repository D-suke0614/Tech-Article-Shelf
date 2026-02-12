/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定（next.config.jsがあるディレクトリ）
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: './jest.env.js',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
}

// createJestConfigは非同期なので、結果を取得してtransformIgnorePatternsを修正
module.exports = async () => {
  const jestConfig = await createJestConfig(customJestConfig)()
  // Next.jsのデフォルト /node_modules/ を除外し、カスタムパターンのみ使用
  jestConfig.transformIgnorePatterns = [
    '/node_modules/(?!(until-async|msw|@mswjs|cheerio|parse5|dom-serializer|htmlparser2|css-select|css-what|domhandler|domutils|nth-check|boolbase|entities)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return jestConfig
}
