import { trpc } from '@/lib/client/trpc'
import { ArticleList } from '@/components/features/article/ArticleList'

export default function Home() {
  const { data: articles, isLoading, error } = trpc.article.list.useQuery()

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

        {!isLoading && !error && <ArticleList articles={articles ?? []} />}
      </main>
    </div>
  )
}
