import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/lib/server/api/root'
import { ArticleCard } from '@/components/features/article/ArticleCard'

type RouterOutputs = inferRouterOutputs<AppRouter>
type Article = RouterOutputs['article']['list'][number]

type ArticleListProps = {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">記事がまだありません</p>
        <p className="text-sm mt-1">URLを入力して記事を登録しましょう</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
