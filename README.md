# Tech Article Shelf

技術記事ブックマーク管理アプリ。Jest × MSW を使ったテスト設計の学習プロジェクト。

## 技術スタック

| カテゴリ       | 技術                                                            |
| -------------- | --------------------------------------------------------------- |
| フロントエンド | Next.js 14 (Pages Router), React 18, TypeScript 5, Tailwind CSS |
| API            | tRPC v11, TanStack Query v5                                     |
| DB             | Prisma v7, LibSQL (SQLite)                                      |
| テスト         | Jest 30, Testing Library, MSW v2                                |
| CI/CD          | GitHub Actions, Codecov                                         |

## 機能

- 記事URL登録（OGP自動取得）
- 記事一覧表示（キーワード検索・タグフィルター）
- お気に入りトグル（楽観的更新）
- 既読/未読管理

## セットアップ

```bash
# 依存関係インストール
npm install

# DBマイグレーション
npx prisma migrate dev

# シードデータ投入
npx prisma db seed

# 開発サーバー起動
npm run dev
```

## テスト

```bash
# テスト実行
npm test

# カバレッジ付きテスト
npx jest --coverage
```

### テストカバレッジ

| 指標       | 達成値 | 目標       |
| ---------- | ------ | ---------- |
| Statements | 84.87% | 80%以上 ✅ |
| Branches   | 70.74% | -          |
| Functions  | 85.93% | -          |
| Lines      | 88.14% | -          |

### テスト構成

```
src/
├── lib/
│   └── shared/utils/url.test.ts          # ユーティリティ関数テスト（TDD）
│   └── server/api/ogp/index.test.ts      # OGP取得テスト（MSW）
│   └── server/api/article/
│       └── error-handling.test.ts        # エラーハンドリングテスト
├── components/
│   ├── ui/
│   │   ├── SearchBar/SearchBar.test.tsx  # コンポーネントテスト
│   │   └── TagFilter/TagFilter.test.tsx  # コンポーネントテスト
│   ├── features/article/
│   │   ├── ArticleCard/ArticleCard.test.tsx
│   │   └── ArticleList/ArticleList.test.tsx
│   └── hooks/
│       ├── useCreateArticle/index.test.ts    # フックテスト（MSW）
│       ├── useArticleFilter/index.test.ts    # フックテスト
│       └── useToggleFavorite/index.test.ts   # 楽観的更新テスト
└── pages/
    └── index.test.tsx                    # ページ統合テスト
```

## テストパターン

このプロジェクトは **AAAパターン（Arrange-Act-Assert）** を採用しています。

### MSWによるAPIモック

```typescript
// テスト内でレスポンスをオーバーライド
server.use(
  http.get('/api/trpc/article.list', () => {
    return HttpResponse.json({ result: { data: superjson.serialize([]) } })
  })
)
```

### 楽観的更新のテスト

```typescript
// 1. mutation発火
act(() => {
  result.current.toggleFavorite({ id: 'article-1', currentValue: true })
})

// 2. isLoading が true になることを確認
await waitFor(() => {
  expect(result.current.isLoading).toBe(true)
})

// 3. 完了後は false
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})
```

## プロジェクト構造

```
src/
├── components/
│   ├── features/article/     # 記事関連コンポーネント
│   ├── hooks/                # カスタムフック
│   ├── providers/            # Reactプロバイダー
│   └── ui/                   # 汎用UIコンポーネント
├── lib/
│   ├── client/               # tRPCクライアント設定
│   ├── server/api/           # tRPCルーター・MSWハンドラー
│   └── shared/               # 共通ユーティリティ
├── pages/                    # Next.jsページ
├── server/                   # tRPC設定
└── test/                     # テストユーティリティ
```
