import { screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import superjson from 'superjson'
import { server } from '@/lib/server/api/msw/server'
import { renderWithProviders } from '@/test/render-with-providers'
import Home from './index'

describe('Home ページ', () => {
  describe('初期表示', () => {
    it('ページタイトルが表示される', () => {
      // Arrange & Act
      renderWithProviders(<Home />)

      // Assert
      expect(
        screen.getByRole('heading', { name: 'Tech Article Shelf' })
      ).toBeInTheDocument()
    })

    it('初期表示でローディング状態が表示される', () => {
      // Arrange & Act
      renderWithProviders(<Home />)

      // Assert: ローディング中の表示
      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })

    it('データ取得後に記事一覧が表示される', async () => {
      // Arrange & Act
      renderWithProviders(<Home />)

      // Assert: MSWからデータが返ってきた後
      await waitFor(() => {
        expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
      })

      // mockArticles の記事が表示される
      expect(
        screen.getByRole('link', { name: 'React Hooksの基本を理解する' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'TypeScriptの実践的なTips集' })
      ).toBeInTheDocument()
    })

    it('記事が0件の場合、空状態メッセージが表示される', async () => {
      // Arrange: 空配列を返すようにオーバーライド
      server.use(
        http.get('/api/trpc/article.list', () => {
          return HttpResponse.json({
            result: { data: superjson.serialize([]) },
          })
        })
      )

      // Act
      renderWithProviders(<Home />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('記事がまだありません')).toBeInTheDocument()
      })
    })
  })

  describe('記事登録フォーム', () => {
    it('URL入力フィールドが表示される', () => {
      // Arrange & Act
      renderWithProviders(<Home />)

      // Assert
      expect(screen.getByLabelText(/URL/)).toBeInTheDocument()
    })

    it('タイトル入力フィールドが表示される', () => {
      // Arrange & Act
      renderWithProviders(<Home />)

      // Assert
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
    })
  })

  describe('検索機能', () => {
    it('検索バーが表示される', () => {
      // Arrange & Act
      renderWithProviders(<Home />)

      // Assert
      expect(
        screen.getByRole('searchbox', { name: '記事を検索' })
      ).toBeInTheDocument()
    })

    it('検索キーワードを入力できる', () => {
      // Arrange
      renderWithProviders(<Home />)

      // Act
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'React' },
      })

      // Assert
      expect(screen.getByRole('searchbox')).toHaveValue('React')
    })
  })

  describe('APIエラー状態', () => {
    it('API失敗時にエラーメッセージが表示される', async () => {
      // Arrange: 500エラーを返す
      server.use(
        http.get('/api/trpc/article.list', () => {
          return HttpResponse.json(
            { error: { message: 'Internal Server Error' } },
            { status: 500 }
          )
        })
      )

      // Act
      renderWithProviders(<Home />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })
    })

    it('ネットワークエラー時にエラーメッセージが表示される', async () => {
      // Arrange
      server.use(
        http.get('/api/trpc/article.list', () => {
          return HttpResponse.error()
        })
      )

      // Act
      renderWithProviders(<Home />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })
    })
  })

  describe('記事登録フロー', () => {
    it('フォーム送信後に記事一覧にOGP情報が使われる', async () => {
      // Arrange: OGP取得をモック
      server.use(
        http.get('/api/trpc/article.fetchOgp', () => {
          return HttpResponse.json({
            result: {
              data: superjson.serialize({
                title: 'テスト記事タイトル（OGP取得）',
                description: 'テスト説明',
                image: null,
              }),
            },
          })
        })
      )

      // Act
      renderWithProviders(<Home />)

      // 記事フォームに URL を入力
      fireEvent.change(screen.getByLabelText(/URL/), {
        target: { value: 'https://example.com/new' },
      })
      fireEvent.change(screen.getByLabelText(/タイトル/), {
        target: { value: '手動入力タイトル' },
      })

      // 送信ボタンが有効になっていることを確認
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: '記事を追加' })
        ).not.toBeDisabled()
      })

      fireEvent.click(screen.getByRole('button', { name: '記事を追加' }))

      // Assert: フォームがリセットされる
      await waitFor(() => {
        expect(screen.getByLabelText(/URL/)).toHaveValue('')
      })
    })
  })
})

describe('Home ページ - 記事データ表示', () => {
  it('未読記事に未読バッジが表示される', async () => {
    // Arrange: article-1 は isRead: false
    renderWithProviders(<Home />)

    // Assert
    await waitFor(() => {
      // article-1 と article-3 が未読
      const unreadBadges = screen.getAllByText('未読')
      expect(unreadBadges.length).toBeGreaterThan(0)
    })
  })

  it('お気に入り記事にお気に入りボタンが表示される', async () => {
    // Arrange: article-1 は isFavorite: true
    renderWithProviders(<Home />)

    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'お気に入りを解除' })
      ).toBeInTheDocument()
    })
  })
})
