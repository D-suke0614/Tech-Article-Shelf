// Jestのセットアップファイル
// テストの前に実行される設定をここに記述できます

import '@testing-library/jest-dom'

// ============================================
// MSW Server Setup
// ============================================
import { server } from './src/lib/server/api/msw/server'
import { resetArticles } from './src/lib/server/api/article/msw'

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // モックされていないリクエストを警告
  })
})
afterEach(() => {
  server.resetHandlers()
  resetArticles() // テスト間で状態をリセット
})
afterAll(() => server.close())
