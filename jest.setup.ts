// Jestのセットアップファイル
// テストの前に実行される設定をここに記述できます

import '@testing-library/jest-dom'

// ============================================
// MSW Server Setup
// ============================================
import { server } from './src/lib/server/api/msw/server'

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // モックされていないリクエストを警告
  })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
