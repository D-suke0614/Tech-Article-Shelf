import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
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

    it('全記事からタグ一覧が抽出される', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert: mockArticles には React, フロントエンド, TypeScript の3タグ
      expect(result.current.allTags.length).toBeGreaterThan(0)
    })
  })

  describe('キーワード検索（クライアントサイドフィルタリング）', () => {
    it('search を設定するとタイトルでフィルタリングされる', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      act(() => {
        result.current.setSearch('React')
      })

      // Assert: "React Hooksの基本を理解する" のみマッチ
      expect(result.current.search).toBe('React')
      expect(result.current.hasActiveFilters).toBe(true)
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].title).toContain('React')
    })

    it('大文字小文字を無視して検索される', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: 小文字で検索
      act(() => {
        result.current.setSearch('typescript')
      })

      // Assert
      expect(result.current.articles.length).toBeGreaterThan(0)
      expect(
        result.current.articles.every(
          (a) =>
            a.title.toLowerCase().includes('typescript') ||
            (a.description?.toLowerCase().includes('typescript') ?? false)
        )
      ).toBe(true)
    })

    it('マッチしないキーワードの場合、空配列が返される', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      act(() => {
        result.current.setSearch('存在しないキーワード12345')
      })

      // Assert
      expect(result.current.articles).toHaveLength(0)
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

    it('タグ選択でフィルタリングされる', async () => {
      // Arrange: tag-1 は article-1 に紐付いている
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      act(() => {
        result.current.toggleTag('tag-1')
      })

      // Assert: tag-1（React）を持つ article-1 のみ表示
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].id).toBe('article-1')
    })
  })

  describe('フィルタークリア', () => {
    it('clearFilters を呼ぶと全フィルターがリセットされる', async () => {
      // Arrange
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useArticleFilter(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

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
      expect(result.current.articles).toHaveLength(mockArticles.length)
    })
  })
})
