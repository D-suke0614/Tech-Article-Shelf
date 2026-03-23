import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import superjson from 'superjson'
import React from 'react'
import { server } from '@/lib/server/api/msw/server'
import { trpc, createTRPCClient } from '@/lib/client/trpc'
import { mockArticles } from '@/lib/server/api/article/msw/fixture'
import { useArticleFilter } from '.'

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

describe('useArticleFilter', () => {
  describe('初期状態', () => {
    it('search が空文字、selectedTagIds が空配列で初期化される', () => {
      // Arrange
      const { wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      // Assert
      expect(result.current.search).toBe('')
      expect(result.current.selectedTagIds).toEqual([])
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('初期表示で全記事が返される', async () => {
      // Arrange
      const { wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.articles).toHaveLength(mockArticles.length)
    })
  })

  describe('キーワード検索', () => {
    it('search を設定するとキーワードフィルターが有効になる', async () => {
      // Arrange
      server.use(
        http.get('/api/trpc/article.list', ({ request }) => {
          const url = new URL(request.url)
          const inputParam = url.searchParams.get('input')
          const input = inputParam
            ? (JSON.parse(inputParam) as { json?: { search?: string } })
            : null
          const search = input?.json?.search

          const filtered = search
            ? mockArticles.filter((a) =>
                a.title.toLowerCase().includes(search.toLowerCase())
              )
            : mockArticles

          return HttpResponse.json({
            result: { data: superjson.serialize(filtered) },
          })
        })
      )
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      // Act
      act(() => {
        result.current.setSearch('React')
      })

      // Assert
      expect(result.current.search).toBe('React')
      expect(result.current.hasActiveFilters).toBe(true)
    })
  })

  describe('タグフィルター', () => {
    it('toggleTag を呼ぶと selectedTagIds にタグが追加される', () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      // Act
      act(() => {
        result.current.toggleTag('tag-1')
      })

      // Assert
      expect(result.current.selectedTagIds).toContain('tag-1')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('選択済みタグを toggleTag すると selectedTagIds から除去される', () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      act(() => {
        result.current.toggleTag('tag-1')
      })
      expect(result.current.selectedTagIds).toContain('tag-1')

      // Act
      act(() => {
        result.current.toggleTag('tag-1')
      })

      // Assert
      expect(result.current.selectedTagIds).not.toContain('tag-1')
    })

    it('複数タグを選択できる', () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      // Act
      act(() => {
        result.current.toggleTag('tag-1')
        result.current.toggleTag('tag-2')
      })

      // Assert
      expect(result.current.selectedTagIds).toEqual(['tag-1', 'tag-2'])
    })
  })

  describe('フィルタークリア', () => {
    it('clearFilters を呼ぶと search と selectedTagIds がリセットされる', () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      act(() => {
        result.current.setSearch('React')
        result.current.toggleTag('tag-1')
      })
      expect(result.current.hasActiveFilters).toBe(true)

      // Act
      act(() => {
        result.current.clearFilters()
      })

      // Assert
      expect(result.current.search).toBe('')
      expect(result.current.selectedTagIds).toEqual([])
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })
})
