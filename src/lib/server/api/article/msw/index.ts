import { http, HttpResponse } from 'msw'
import superjson, { type SuperJSONResult } from 'superjson'
import { mockArticles, type ArticleWithTags } from './fixture'

let articles = [...mockArticles]

type TRPCBatchRequest = {
  '0': SuperJSONResult
}

function createTRPCResponse<T>(data: T) {
  const serialized = superjson.serialize(data)
  return {
    result: {
      data: serialized,
    },
  }
}

export const articleHandlers = [
  // article.list - 記事一覧取得（検索・フィルタ対応）
  http.get('/api/trpc/article.list', ({ request }) => {
    const url = new URL(request.url)
    const inputParam = url.searchParams.get('input')

    let filtered = [...articles]

    if (inputParam) {
      try {
        const input = JSON.parse(inputParam) as {
          json?: { search?: string; tagIds?: string[] }
        }
        const { search, tagIds } = input.json ?? {}

        if (search) {
          const lower = search.toLowerCase()
          filtered = filtered.filter(
            (a) =>
              a.title.toLowerCase().includes(lower) ||
              (a.description?.toLowerCase().includes(lower) ?? false)
          )
        }

        if (tagIds && tagIds.length > 0) {
          filtered = filtered.filter((a) =>
            a.tags.some((t) => tagIds.includes(t.id))
          )
        }
      } catch {
        // parse失敗時は全件返す
      }
    }

    return HttpResponse.json(createTRPCResponse(filtered))
  }),

  // article.create - 記事作成
  http.post('/api/trpc/article.create', async ({ request }) => {
    const body = (await request.json()) as TRPCBatchRequest
    const input = superjson.deserialize(body['0']) as {
      url: string
      title: string
      description?: string
      thumbnail?: string
    }

    const newArticle: ArticleWithTags = {
      id: `article-${Date.now()}`,
      url: input.url,
      title: input.title,
      description: input.description ?? null,
      thumbnail: input.thumbnail ?? null,
      isRead: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }

    articles = [newArticle, ...articles]
    return HttpResponse.json(createTRPCResponse(newArticle))
  }),

  // article.toggleRead - 既読/未読トグル
  http.post('/api/trpc/article.toggleRead', async ({ request }) => {
    const body = (await request.json()) as TRPCBatchRequest
    const input = superjson.deserialize(body['0']) as {
      id: string
      currentValue: boolean
    }

    const article = articles.find((a) => a.id === input.id)
    if (!article) {
      return HttpResponse.json(
        { error: { message: 'Article not found' } },
        { status: 404 }
      )
    }

    article.isRead = !input.currentValue
    article.updatedAt = new Date()

    return HttpResponse.json(createTRPCResponse(article))
  }),

  // article.toggleFavorite - お気に入りトグル
  http.post('/api/trpc/article.toggleFavorite', async ({ request }) => {
    const body = (await request.json()) as TRPCBatchRequest
    const input = superjson.deserialize(body['0']) as {
      id: string
      currentValue: boolean
    }

    const article = articles.find((a) => a.id === input.id)
    if (!article) {
      return HttpResponse.json(
        { error: { message: 'Article not found' } },
        { status: 404 }
      )
    }

    article.isFavorite = !input.currentValue
    article.updatedAt = new Date()

    return HttpResponse.json(createTRPCResponse(article))
  }),
]

export function resetArticles() {
  articles = [...mockArticles]
}
