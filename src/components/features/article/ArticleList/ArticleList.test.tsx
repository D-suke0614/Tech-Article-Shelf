import { render, screen } from '@testing-library/react'
import { ArticleList } from './ArticleList'
import type { ArticleWithTags } from '@/lib/server/api/article/msw/fixture'

const makeArticle = (
  overrides: Partial<ArticleWithTags> = {}
): ArticleWithTags => ({
  id: 'article-1',
  url: 'https://example.com/article-1',
  title: '記事1のタイトル',
  description: null,
  thumbnail: null,
  isRead: false,
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  ...overrides,
})

describe('ArticleList', () => {
  describe('記事一覧の表示', () => {
    it('複数の記事が表示される', () => {
      // Arrange
      const articles = [
        makeArticle({ id: 'article-1', title: '記事1のタイトル' }),
        makeArticle({
          id: 'article-2',
          url: 'https://example.com/article-2',
          title: '記事2のタイトル',
        }),
        makeArticle({
          id: 'article-3',
          url: 'https://example.com/article-3',
          title: '記事3のタイトル',
        }),
      ]
      render(<ArticleList articles={articles} />)

      // Assert
      expect(
        screen.getByRole('link', { name: '記事1のタイトル' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: '記事2のタイトル' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: '記事3のタイトル' })
      ).toBeInTheDocument()
    })
  })

  describe('空状態の表示', () => {
    it('記事がない場合、「記事がまだありません」が表示される', () => {
      // Arrange
      render(<ArticleList articles={[]} />)

      // Assert
      expect(screen.getByText('記事がまだありません')).toBeInTheDocument()
    })

    it('記事がない場合、登録を促すメッセージが表示される', () => {
      // Arrange
      render(<ArticleList articles={[]} />)

      // Assert
      expect(
        screen.getByText('URLを入力して記事を登録しましょう')
      ).toBeInTheDocument()
    })

    it('記事がない場合、記事リンクは表示されない', () => {
      // Arrange
      render(<ArticleList articles={[]} />)

      // Assert
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })
})
