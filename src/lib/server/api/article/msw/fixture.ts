export type ArticleWithTags = {
  id: string
  url: string
  title: string
  description: string | null
  thumbnail: string | null
  isRead: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  tags: {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
  }[]
}

export const mockArticles: ArticleWithTags[] = [
  {
    id: 'article-1',
    url: 'https://example.com/react-hooks',
    title: 'React Hooksの基本を理解する',
    description:
      'React Hooksの基本的な使い方と、useStateやuseEffectの仕組みについて解説します。',
    thumbnail: 'https://example.com/images/react-hooks.png',
    isRead: false,
    isFavorite: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    tags: [
      {
        id: 'tag-1',
        name: 'React',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: 'tag-2',
        name: 'フロントエンド',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ],
  },
  {
    id: 'article-2',
    url: 'https://example.com/typescript-tips',
    title: 'TypeScriptの実践的なTips集',
    description: '実務で役立つTypeScriptのテクニックを紹介します。',
    thumbnail: 'https://example.com/images/typescript.png',
    isRead: true,
    isFavorite: false,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-12T15:30:00Z'),
    tags: [
      {
        id: 'tag-3',
        name: 'TypeScript',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ],
  },
  {
    id: 'article-3',
    url: 'https://example.com/testing-best-practices',
    title: 'フロントエンドテストのベストプラクティス',
    description: null,
    thumbnail: null,
    isRead: false,
    isFavorite: false,
    createdAt: new Date('2024-01-08T14:00:00Z'),
    updatedAt: new Date('2024-01-08T14:00:00Z'),
    tags: [],
  },
]
