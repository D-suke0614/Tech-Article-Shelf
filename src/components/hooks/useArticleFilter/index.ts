import { useState } from 'react'
import { trpc } from '@/lib/client/trpc'

export function useArticleFilter() {
  const [search, setSearch] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const {
    data: articles,
    isLoading,
    error,
  } = trpc.article.list.useQuery(
    {
      search: search || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    },
    {
      keepPreviousData: true,
    } as Parameters<typeof trpc.article.list.useQuery>[1]
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
    articles: articles ?? [],
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
