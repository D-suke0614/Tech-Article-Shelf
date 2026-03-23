import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import superjson from 'superjson'
import React from 'react'
import { server } from '@/lib/server/api/msw/server'
import { trpc, createTRPCClient } from '@/lib/client/trpc'
import { useToggleFavorite } from '.'

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

describe('useToggleFavorite', () => {
  describe('初期状態', () => {
    it('isLoading が false、error が null で初期化される', () => {
      // Arrange
      const { wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Assert
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('楽観的更新', () => {
    it('toggleFavorite 呼び出し開始から完了まで isLoading が変化する', async () => {
      // Arrange: 少し遅延させてローディング状態を確認できるようにする
      server.use(
        http.post('/api/trpc/article.toggleFavorite', async () => {
          await new Promise((resolve) => setTimeout(resolve, 50))
          const updated = { isFavorite: false }
          return HttpResponse.json({
            result: { data: superjson.serialize(updated) },
          })
        })
      )

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Act
      act(() => {
        result.current.toggleFavorite({ id: 'article-1', currentValue: true })
      })

      // Assert: 呼び出し中に isLoading が true になる
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // 完了後は false に戻る
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('onSettled で article.list キャッシュが再検証される', async () => {
      // Arrange
      const { wrapper, queryClient } = createWrapper()
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Act
      act(() => {
        result.current.toggleFavorite({ id: 'article-1', currentValue: true })
      })

      // Assert: invalidateQueries が呼ばれる
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalled()
      })
    })
  })

  describe('API成功時', () => {
    it('成功後に isLoading が false、error が null になる', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Act
      act(() => {
        result.current.toggleFavorite({ id: 'article-1', currentValue: true })
      })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.error).toBeNull()
    })

    it('遅延レスポンス後も最終的に isLoading が false になる', async () => {
      // Arrange: 100ms の遅延レスポンスをシミュレート
      server.use(
        http.post('/api/trpc/article.toggleFavorite', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          const updated = { isFavorite: false }
          return HttpResponse.json({
            result: { data: superjson.serialize(updated) },
          })
        })
      )

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Act
      act(() => {
        result.current.toggleFavorite({ id: 'article-1', currentValue: true })
      })

      // Assert
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('API失敗時のロールバック', () => {
    it('APIエラー時、error が設定される', async () => {
      // Arrange: toggleFavorite を常にエラーにする
      server.use(
        http.post('/api/trpc/article.toggleFavorite', () => {
          return HttpResponse.json(
            { error: { message: 'Server Error' } },
            { status: 500 }
          )
        })
      )

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Act
      act(() => {
        result.current.toggleFavorite({ id: 'article-1', currentValue: true })
      })

      // Assert: API失敗後にエラー状態になる
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('ネットワークエラー時も error が設定される', async () => {
      // Arrange
      server.use(
        http.post('/api/trpc/article.toggleFavorite', () => {
          return HttpResponse.error()
        })
      )

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useToggleFavorite(), { wrapper })

      // Act
      act(() => {
        result.current.toggleFavorite({ id: 'article-1', currentValue: true })
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })
    })
  })
})
