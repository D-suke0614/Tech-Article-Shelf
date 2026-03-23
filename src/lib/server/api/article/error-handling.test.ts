/**
 * Day 21: エラーハンドリング強化テスト
 * ネットワークエラー・タイムアウト・各種HTTPステータスコードのテスト
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { server } from '@/lib/server/api/msw/server'
import { trpc, createTRPCClient } from '@/lib/client/trpc'
import { useArticleFilter } from '@/components/hooks/useArticleFilter'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const trpcClient = createTRPCClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      trpc.Provider,
      { client: trpcClient, queryClient },
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    )
  }

  return { wrapper: Wrapper, queryClient }
}

describe('エラーハンドリング強化テスト', () => {
  describe('article.list - ネットワークエラー', () => {
    it('ネットワークエラー時、error が設定される', async () => {
      // Arrange
      server.use(
        http.get('/api/trpc/article.list', () => {
          return HttpResponse.error()
        })
      )

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.error).not.toBeNull()
      expect(result.current.articles).toEqual([])
    })
  })

  describe('article.list - 各種HTTPエラーステータス', () => {
    const errorCases = [
      { status: 400, label: '400 Bad Request' },
      { status: 401, label: '401 Unauthorized' },
      { status: 403, label: '403 Forbidden' },
      { status: 404, label: '404 Not Found' },
      { status: 500, label: '500 Internal Server Error' },
    ]

    errorCases.forEach(({ status, label }) => {
      it(`${label} の場合、error が設定される`, async () => {
        // Arrange
        server.use(
          http.get('/api/trpc/article.list', () => {
            return HttpResponse.json({ error: { message: label } }, { status })
          })
        )

        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useArticleFilter(), { wrapper })

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.error).not.toBeNull()
      })
    })
  })

  describe('article.create - エラー時の状態管理', () => {
    it('400エラー時、mutation の error が設定される', async () => {
      // Arrange
      server.use(
        http.post('/api/trpc/article.create', () => {
          return HttpResponse.json(
            {
              error: {
                json: {
                  message: 'Bad Request',
                  code: -32600,
                  data: { code: 'BAD_REQUEST' },
                },
              },
            },
            { status: 400 }
          )
        })
      )

      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      })
      const trpcClient = createTRPCClient()

      const { result } = renderHook(() => trpc.article.create.useMutation(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            trpc.Provider,
            { client: trpcClient, queryClient },
            React.createElement(
              QueryClientProvider,
              { client: queryClient },
              children
            )
          ),
      })

      // Act
      act(() => {
        result.current.mutate({
          url: 'https://example.com/article',
          title: 'テスト記事',
        })
      })

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
      expect(result.current.isPending).toBe(false)
    })
  })

  describe('article.toggleFavorite - タイムアウトシミュレート', () => {
    it('遅延レスポンス（タイムアウト相当）でも最終的に処理が完了する', async () => {
      // Arrange: 200ms の遅延（テスト環境でのタイムアウトシミュレート）
      server.use(
        http.post('/api/trpc/article.toggleFavorite', async () => {
          await new Promise((resolve) => setTimeout(resolve, 200))
          return HttpResponse.json(
            { error: { message: 'Timeout' } },
            { status: 408 }
          )
        })
      )

      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      })
      const trpcClient = createTRPCClient()

      const { result } = renderHook(
        () => trpc.article.toggleFavorite.useMutation(),
        {
          wrapper: ({ children }: { children: React.ReactNode }) =>
            React.createElement(
              trpc.Provider,
              { client: trpcClient, queryClient },
              React.createElement(
                QueryClientProvider,
                { client: queryClient },
                children
              )
            ),
        }
      )

      // Act
      act(() => {
        result.current.mutate({ id: 'article-1', currentValue: true })
      })

      // Assert: タイムアウト後も isError になる（isPending が解消される）
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 5000 }
      )
      expect(result.current.isPending).toBe(false)
    })
  })
})
