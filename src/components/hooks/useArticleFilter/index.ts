import { useState, useMemo } from 'react'
import { trpc } from '@/lib/client/trpc'

export function useArticleFilter() {
  const [search, setSearch] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // フィルタなしで全記事を取得（タグ一覧抽出用）
  const { data: allArticles, isLoading, error } = trpc.article.list.useQuery()

  // クライアントサイドでフィルタリング
  const articles = useMemo(() => {
    if (!allArticles) return []

    let filtered = allArticles

    if (search) {
      const lower = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          (a.description?.toLowerCase().includes(lower) ?? false)
      )
    }

    if (selectedTagIds.length > 0) {
      filtered = filtered.filter((a) =>
        a.tags.some((t) => selectedTagIds.includes(t.id))
      )
    }

    return filtered
  }, [allArticles, search, selectedTagIds])

  // 全記事からタグ一覧を抽出（重複なし）
  const allTags = useMemo(
    () =>
      Array.from(
        new Map(
          (allArticles ?? []).flatMap((a) => a.tags).map((t) => [t.id, t])
        ).values()
      ),
    [allArticles]
  )

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  function clearFilters() {
    setSearch('')
    setSelectedTagIds([])
  }

  const hasActiveFilters = search !== '' || selectedTagIds.length > 0

  return {
    articles,
    allTags,
    isLoading,
    error,
    search,
    setSearch,
    selectedTagIds,
    toggleTag,
    clearFilters,
    hasActiveFilters,
  }
}
