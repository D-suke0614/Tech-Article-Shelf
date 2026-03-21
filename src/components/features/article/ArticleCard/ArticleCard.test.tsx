import { render, screen } from '@testing-library/react'
import { ArticleCard } from './ArticleCard'
import type { ArticleWithTags } from '@/lib/server/api/article/msw/fixture'

const baseArticle: ArticleWithTags = {
  id: 'test-1',
  url: 'https://example.com/test',
  title: 'テスト記事タイトル',
  description: 'テスト記事の説明',
  thumbnail: 'https://example.com/thumbnail.png',
  isRead: false,
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
}

describe('ArticleCard', () => {
  describe('基本表示', () => {
    it('記事タイトルがリンクとして表示される', () => {
      // Arrange
      render(<ArticleCard article={baseArticle} />)

      // Act & Assert
      expect(
        screen.getByRole('link', { name: 'テスト記事タイトル' })
      ).toBeInTheDocument()
    })

    it('サムネイルが存在する場合、画像が表示される', () => {
      // Arrange
      render(<ArticleCard article={baseArticle} />)

      // Assert
      expect(
        screen.getByRole('img', { name: 'テスト記事タイトル' })
      ).toBeInTheDocument()
    })

    it('サムネイルがnullの場合、画像は表示されない', () => {
      // Arrange
      const article = { ...baseArticle, thumbnail: null }
      render(<ArticleCard article={article} />)

      // Assert
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('descriptionが存在する場合、説明文が表示される', () => {
      // Arrange
      render(<ArticleCard article={baseArticle} />)

      // Assert
      expect(screen.getByText('テスト記事の説明')).toBeInTheDocument()
    })
  })

  describe('未読バッジ', () => {
    it('未読の場合（isRead: false）、未読バッジが表示される', () => {
      // Arrange
      render(<ArticleCard article={{ ...baseArticle, isRead: false }} />)

      // Assert
      expect(screen.getByText('未読')).toBeInTheDocument()
    })

    it('既読の場合（isRead: true）、未読バッジが表示されない', () => {
      // Arrange
      render(<ArticleCard article={{ ...baseArticle, isRead: true }} />)

      // Assert
      expect(screen.queryByText('未読')).not.toBeInTheDocument()
    })
  })

  describe('お気に入りバッジ', () => {
    it('お気に入りの場合（isFavorite: true）、お気に入りバッジが表示される', () => {
      // Arrange
      render(<ArticleCard article={{ ...baseArticle, isFavorite: true }} />)

      // Assert
      expect(screen.getByText('お気に入り')).toBeInTheDocument()
    })

    it('お気に入りでない場合（isFavorite: false）、お気に入りバッジが表示されない', () => {
      // Arrange
      render(<ArticleCard article={{ ...baseArticle, isFavorite: false }} />)

      // Assert
      expect(screen.queryByText('お気に入り')).not.toBeInTheDocument()
    })
  })

  describe('タグ表示', () => {
    it('タグがある場合、タグ名が表示される', () => {
      // Arrange
      const article = {
        ...baseArticle,
        tags: [
          {
            id: 'tag-1',
            name: 'React',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'tag-2',
            name: 'TypeScript',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }
      render(<ArticleCard article={article} />)

      // Assert
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })
})
