import Image from 'next/image'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/lib/server/api/root'
import { extractDomain } from '@/lib/shared/utils/url'
import { useToggleFavorite } from '@/components/hooks/useToggleFavorite'

type RouterOutputs = inferRouterOutputs<AppRouter>
type Article = RouterOutputs['article']['list'][number]

type ArticleCardProps = {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const domain = extractDomain(article.url)
  const { toggleFavorite } = useToggleFavorite()

  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {article.thumbnail && (
        <div className="relative w-full h-40">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {!article.isRead && (
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              未読
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              toggleFavorite({
                id: article.id,
                currentValue: article.isFavorite,
              })
            }
            aria-label={
              article.isFavorite ? 'お気に入りを解除' : 'お気に入りに追加'
            }
            aria-pressed={article.isFavorite}
            className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
              article.isFavorite
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {article.isFavorite ? 'お気に入り' : '☆'}
          </button>
        </div>

        <h2 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            {article.title}
          </a>
        </h2>

        {article.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {article.description}
          </p>
        )}

        <span className="text-xs text-gray-400">{domain}</span>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
