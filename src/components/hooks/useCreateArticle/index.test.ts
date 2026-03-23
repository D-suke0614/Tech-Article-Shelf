import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { server } from '@/lib/server/api/msw/server'
import { trpc, createTRPCClient } from '@/lib/client/trpc'
import { useCreateArticle } from '.'

// テスト用のwrapper生成（TRPCProvider相当）
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

describe('useCreateArticle', () => {
  describe('初期状態', () => {
    it('isLoadingがfalse、errorがnullで初期化される', () => {
      // Arrange
      const { wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useCreateArticle(), { wrapper })

      // Assert
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('成功時', () => {
    it('createArticleが作成された記事を返す', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateArticle(), { wrapper })
      const input = {
        url: 'https://example.com/new-article',
        title: '新しい記事',
        description: '記事の説明',
      }

      // Act
      let createdArticle: unknown
      await act(async () => {
        createdArticle = await result.current.createArticle(input)
      })

      // Assert
      expect(createdArticle).toMatchObject({
        url: input.url,
        title: input.title,
      })
    })

    it('成功後にisLoadingがfalse、errorがnullになる', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateArticle(), { wrapper })

      // Act
      await act(async () => {
        await result.current.createArticle({
          url: 'https://example.com/article',
          title: 'テスト記事',
        })
      })

      // Assert
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('成功後にarticle.listキャッシュが無効化される', async () => {
      // Arrange
      const { wrapper, queryClient } = createWrapper()
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useCreateArticle(), { wrapper })

      // Act
      await act(async () => {
        await result.current.createArticle({
          url: 'https://example.com/article',
          title: 'テスト記事',
        })
      })

      // Assert
      expect(invalidateSpy).toHaveBeenCalled()
    })
  })

  describe('失敗時', () => {
    it('APIエラー時にerrorが設定される', async () => {
      // Arrange: ネットワークエラーでAPIが失敗するケース
      server.use(
        http.post('/api/trpc/article.create', () => {
          return HttpResponse.error()
        })
      )
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateArticle(), { wrapper })

      // Act
      await act(async () => {
        try {
          await result.current.createArticle({
            url: 'https://example.com/article',
            title: 'テスト記事',
          })
        } catch {
          // mutateAsyncはエラー時にthrowするため、catchで握りつぶす
        }
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('reset後にerrorがクリアされる', async () => {
      // Arrange
      server.use(
        http.post('/api/trpc/article.create', () => {
          return HttpResponse.error()
        })
      )
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useCreateArticle(), { wrapper })

      await act(async () => {
        try {
          await result.current.createArticle({
            url: 'https://example.com/article',
            title: 'テスト記事',
          })
        } catch {
          // mutateAsyncはエラー時にthrowするため、catchで握りつぶす
        }
      })
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      // Act
      await act(async () => {
        result.current.reset()
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })
})
