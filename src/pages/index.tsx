import { trpc } from '@/lib/client/trpc'
import { ArticleList } from '@/components/features/article/ArticleList'
import { ArticleForm } from '@/components/features/article/ArticleForm'
import { SearchBar } from '@/components/ui/SearchBar'
import { TagFilter } from '@/components/ui/TagFilter'
import { useArticleFilter } from '@/components/hooks/useArticleFilter'

export default function Home() {
  const { data: allArticles } = trpc.article.list.useQuery()
  const {
    articles,
    isLoading,
    error,
    search,
    setSearch,
    selectedTagIds,
    toggleTag,
    clearFilters,
    hasActiveFilters,
  } = useArticleFilter()

  // 全記事からタグ一覧を抽出（重複なし）
  const allTags = Array.from(
    new Map(
      (allArticles ?? []).flatMap((a) => a.tags).map((t) => [t.id, t])
    ).values()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Tech Article Shelf
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <ArticleForm />
        </div>

        {/* 検索・フィルターエリア */}
        <div className="mb-6 space-y-3">
          <SearchBar value={search} onChange={setSearch} />
          {allTags.length > 0 && (
            <TagFilter
              tags={allTags}
              selectedTagIds={selectedTagIds}
              onToggle={toggleTag}
            />
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              フィルターをクリア
            </button>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-400">
            <p>読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500">
            <p>エラーが発生しました</p>
            <p className="text-sm mt-1 text-red-400">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && <ArticleList articles={articles} />}
      </main>
    </div>
  )
}
