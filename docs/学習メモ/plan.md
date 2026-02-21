# 🎯 Jest × MSW 30日間学習計画

> **最終更新**: Day 9 完了時点（計画見直し: 2026-02-12）
> **プロジェクト**: Tech Article Shelf（技術記事ブックマーク管理）

---

## 📋 概要

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 期間         | 30日間（1日1時間）                                                   |
| 目標         | Jest/MSWを使ったテスト設計の習得                                     |
| 成果物       | Tech Article Shelf アプリ + LT発表 + 技術記事                        |
| 技術スタック | Next.js 14 (Pages Router), tRPC, MSW v2, Jest, Prisma, SQLite        |
| リポジトリ   | `/Users/daisuke/Documents/Projects/self-projects/tech-article-shelf` |

---

## 🏆 成果物チェックリスト

### Must（必須）

- [ ] GitHubリポジトリ公開（README、テストコード込み）
- [ ] アプリがVercelでデプロイ済み
- [ ] テストカバレッジ80%以上

### Want（あれば尚良し）

- [ ] LTスライド完成（10分）
- [ ] Zenn/Qiita記事公開

### Bonus（ボーナス）

- [ ] GitHub Actionsでテスト自動化
- [ ] Codecovでカバレッジバッジ

---

## 📊 進捗サマリー

| Week   | 期間      | ステータス | 完了率    |
| ------ | --------- | ---------- | --------- |
| Week 1 | Day 1-7   | ✅ 完了    | 100%      |
| Week 2 | Day 8-14  | 🔄 進行中  | 43% (3/7) |
| Week 3 | Day 15-21 | ⬜ 未着手  | 0%        |
| Week 4 | Day 22-30 | ⬜ 未着手  | 0%        |

---

## 📅 Week 1：基礎学習 + 環境構築（✅ 完了）

### Day 1-3（3h）：Jest/MSW概念学習

- [x] Jest公式ドキュメント読み込み
- [x] `describe` / `it` / `test` の違いと使い分け
- [x] `expect` と主要なマッチャー
- [x] `beforeEach` / `afterEach` / `beforeAll` / `afterAll`
- [x] MSW v2の仕組み理解（Service Workerによるインターセプト）
- [x] `http.get()` / `http.post()` などのハンドラー定義
- [x] テストの種類（ユニット/統合/E2E）の理解

### Day 4（1h）：プロジェクト初期構築

- [x] Next.js 14プロジェクト作成
- [x] Jest設定（`jest.config.js`, `jest.setup.ts`）
- [x] MSW初期設定（server.ts作成）
- [x] 最初のテスト通過確認

**ハマりポイント:**

- `jest.setup.js` → `jest.setup.ts` の拡張子問題
- MSW v2のFetch API問題（Day 9で解決）

### Day 5（1h）：Prismaセットアップ

- [x] スキーマ定義（Article, Tag）
- [x] LibSQLアダプター導入
- [x] Seedデータ作成

**ハマりポイント:**

- Prisma v6の設定変更（`prisma.config.ts` 必要）
- PrismaClient + LibSQLアダプター構成

### Day 6（1h）：tRPC基本セットアップ

- [x] `context.ts`（Prismaインスタンス共有）
- [x] `trpc.ts`（router, publicProcedure）
- [x] `article.ts`（list, create, toggleRead, toggleFavorite）
- [x] `root.ts`（ルーター統合）
- [x] `[trpc].ts`（Next.js API handler）
- [x] 動作確認（`/api/trpc/article.list`）

### Day 7（1h）：Week 1 振り返り

- [x] 学んだことの整理
- [x] ハマりポイントの振り返り
- [x] MSWでtRPCをモックする方法の深掘り
- [x] テストのベストプラクティス学習（7原則）
- [x] Week 2計画の調整

---

## 📅 Week 2：アプリ実装 + ユニットテスト（🔄 進行中）

### Day 8（1h）：ユーティリティ関数 + テスト ✅

- [x] `src/lib/shared/utils/url.ts` 作成
  - [x] `isValidUrl()` - URL形式の検証
  - [x] `extractDomain()` - ドメイン抽出
  - [x] `normalizeUrl()` - URL正規化
- [x] `src/lib/shared/utils/url.test.ts` 作成
  - [x] 正常系テスト（http/https、パス付き、クエリパラメータ付き）
  - [x] 異常系テスト（空文字、プロトコルなし、不正形式）
  - [x] 境界値テスト
- [x] TDDで実装（テスト先行）

**学び:**

- Arrange-Act-Assert パターンの実践
- 境界値テストの重要性
- テスト命名規則（「何をしたら」「どうなる」）

### Day 9（1h）：MSW本格セットアップ + OGP取得ロジック ✅

- [x] `undici` インストール（Fetch API Polyfill）
- [x] `jest.setup.ts` 更新
  - [x] `fetch`, `Request`, `Response`, `Headers` のPolyfill設定
  - [x] `TextEncoder`, `TextDecoder` のPolyfill設定
  - [x] MSWサーバーのライフサイクル設定
- [x] `src/lib/server/api/msw/server.ts` 作成
- [x] `src/lib/server/api/ogp/` 作成
  - [x] `types.ts` - OgpData型定義
  - [x] `index.ts` - fetchOgpData実装（cheerio使用）
  - [x] `index.test.ts` - MSWを使ったテスト

**ハマりポイント:**

- `ReferenceError: Response is not defined` → undici Polyfillで解決
- `ReferenceError: TextDecoder is not defined` → Node.js util からimport
- cheerioはjQuery依存なし（jQuery-like構文を提供するのみ）

**学び:**

- MSWがHTTPリクエストをインターセプトする仕組み
- `server.use()` でテスト毎にハンドラーを上書き
- `afterEach` + `resetHandlers()` でテスト間の状態をクリーンに保つ

### Day 10（1h）：tRPCクライアント設定 + MSWハンドラー ✅

- [x] `src/lib/client/trpc.ts` 作成
  - [x] tRPC React Query hooks設定
  - [x] httpBatchLink設定
  - [x] superjsonトランスフォーマー設定（サーバー側と一致）
- [x] `src/components/providers/TRPCProvider.tsx` 作成
  - [x] QueryClientProvider + tRPCProvider統合
- [x] `_app.tsx` にProvider追加
- [x] `src/lib/server/api/article/msw/` 実装（空ファイルが既に存在）
  - [x] `index.ts` - articleルーターのMSWハンドラー
  - [x] `fixture.ts` - テスト用固定データ（Article型に準拠）
- [x] MSWハンドラーをserver.tsに統合
- [x] ビルド・テスト実行で動作確認

**ハマりポイント:**

- superjsonとその依存関係（copy-anything, is-what）がESMのため、Jest設定で`transformIgnorePatterns`に追加が必要
- tRPCのMutationリクエストボディは `{ "0": { json, meta } }` 形式（バッチリクエスト）
- tRPCレスポンスは `{ result: { data: { json, meta } } }` 形式（superjson対応）

**学び:**

- `createTRPCReact<AppRouter>()` で型安全なクライアントを作成（サーバーの型が自動伝播）
- `useState(() => new QueryClient())` パターンでProviderのインスタンスを安定化
- MSW v2では `http.get()` + `HttpResponse.json()` の新API
- フィクスチャは正常系・エッジケース（null、空配列）を網羅して設計

**tRPCリクエスト形式（参考）:**

```
Query（GET）: /api/trpc/article.list?input={}
Mutation（POST）: /api/trpc/article.create
レスポンス: { result: { data: { json: [...] } } }
```

### Day 11（1h）：記事一覧ページ実装

- [ ] `src/pages/index.tsx` - 記事一覧ページ（現在はデフォルトテンプレート）
- [ ] `src/components/features/article/ArticleCard/` - 記事カードコンポーネント
  - [ ] `ArticleCard.tsx`
  - [ ] `index.ts`（re-export）
- [ ] `src/components/features/article/ArticleList/` - 記事リストコンポーネント
  - [ ] `ArticleList.tsx`
  - [ ] `index.ts`（re-export）
- [ ] tRPCの `trpc.article.list.useQuery()` で記事取得
- [ ] ローディング、エラー、空状態のUI（Tailwind CSS使用）

### Day 12（1h）：記事一覧のコンポーネントテスト

- [ ] `src/components/features/article/ArticleCard/ArticleCard.test.tsx`
  - [ ] 記事のタイトルとサムネイルが表示される
  - [ ] 未読の場合、未読バッジが表示される
  - [ ] お気に入りアイコンをクリックするとコールバックが呼ばれる
- [ ] `src/components/features/article/ArticleList/ArticleList.test.tsx`
  - [ ] 複数記事の表示
  - [ ] 空の場合のメッセージ表示
- [ ] Testing Libraryのクエリ優先順位を意識（getByRole > getByText）

### Day 13（1h）：記事登録フォーム実装

- [ ] `src/components/features/article/ArticleForm/`
  - [ ] `ArticleForm.tsx` - URL入力フィールド + タグ選択 + 送信ボタン
  - [ ] `index.ts`（re-export）
- [ ] `src/components/hooks/useCreateArticle/`
  - [ ] `index.ts` - tRPC mutationのラッパー
  - [ ] ローディング状態管理
  - [ ] エラーハンドリング
- [ ] OGP取得APIと連携（URL入力時に自動取得を検討）

### Day 14（1h）：Week 2 振り返り + カスタムフックテスト

- [ ] `src/components/hooks/useCreateArticle/index.test.ts`
  - [ ] `renderHook` を使用（@testing-library/react）
  - [ ] MSWでtRPC APIモック
  - [ ] 成功時：記事が作成され、キャッシュが更新される
  - [ ] 失敗時：エラー状態が設定される
- [ ] 振り返り
  - [ ] 実装したテストパターンを整理（ユニット/コンポーネント/フック）
  - [ ] Week 3の計画調整

**Week 2 完了時点での成果物:**

- tRPCクライアント設定完了
- MSWハンドラー実装完了
- 記事一覧ページ + コンポーネント
- 記事登録フォーム
- 各種テスト

---

## 📅 Week 3：応用機能 + 統合テスト

### Day 15（1h）：検索・フィルタ機能実装

- [ ] `src/components/ui/SearchBar/` - キーワード検索コンポーネント
- [ ] `src/components/ui/TagFilter/` - タグフィルターコンポーネント
- [ ] `src/components/hooks/useArticleFilter/` - フィルタロジック
- [ ] tRPCの `article.list` にフィルタパラメータ追加（zodスキーマ更新）

### Day 16（1h）：検索機能のテスト

- [ ] `src/components/hooks/useArticleFilter/index.test.ts`
  - [ ] キーワード検索の動作
  - [ ] タグフィルターの動作
  - [ ] 複合条件での絞り込み
- [ ] MSWハンドラーにクエリパラメータ対応追加
- [ ] `SearchBar.test.tsx`, `TagFilter.test.tsx` 作成

### Day 17（1h）：楽観的更新の実装

- [ ] `toggleFavorite` の楽観的更新
  ```typescript
  const utils = trpc.useUtils()
  const toggleFavorite = trpc.article.toggleFavorite.useMutation({
    onMutate: async (articleId) => {
      await utils.article.list.cancel()
      const previousData = utils.article.list.getData()
      utils.article.list.setData(undefined, (old) =>
        old?.map((article) =>
          article.id === articleId
            ? { ...article, isFavorite: !article.isFavorite }
            : article
        )
      )
      return { previousData }
    },
    onError: (err, articleId, context) => {
      utils.article.list.setData(undefined, context?.previousData)
    },
  })
  ```

### Day 18（1h）：楽観的更新のテスト

- [ ] `src/components/hooks/useToggleFavorite/index.test.ts`
  - [ ] 即座にUIが更新されることを検証
  - [ ] API成功時：状態が維持される
  - [ ] API失敗時：ロールバックされる
- [ ] MSWで遅延レスポンス、エラーレスポンスをシミュレート
  ```typescript
  // 遅延レスポンスの例
  http.post('/api/trpc/article.toggleFavorite', async () => {
    await delay(500) // 500ms遅延
    return HttpResponse.json({ result: { data: { json: { success: true } } } })
  })
  ```

### Day 19（1h）：ページ統合テスト（1）

- [ ] `src/pages/index.test.tsx`
  - [ ] 初期表示で記事一覧がロードされる（MSWでモック）
  - [ ] 記事を検索できる
  - [ ] ローディング状態の表示
- [ ] TRPCProviderでラップしたテスト用レンダラー作成

### Day 20（1h）：ページ統合テスト（2）

- [ ] 記事登録フローのテスト
  - [ ] フォーム入力 → 送信 → 一覧に追加される
- [ ] エラー状態のテスト
  - [ ] API失敗時のエラーメッセージ表示
  - [ ] リトライボタンの動作

### Day 21（1h）：Week 3 振り返り + エラーハンドリング強化

- [ ] エラーパターンのテスト追加
  - [ ] ネットワークエラー
  - [ ] タイムアウト
  - [ ] 400/401/403/404/500 各ステータスコード
- [ ] 振り返り
  - [ ] 統合テストで学んだことを整理

---

## 📅 Week 4：仕上げ + アウトプット準備

### Day 22（1h）：カバレッジ確認 + テスト追加

- [ ] カバレッジ分析
  ```bash
  npm test -- --coverage
  ```
- [ ] カバレッジレポートを確認
- [ ] 不足している部分にテスト追加
- [ ] 目標：Statement 80%以上

### Day 23（1h）：CI/CD設定

- [ ] `.github/workflows/test.yml` 作成
  ```yaml
  name: Test
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
        - run: npm ci
        - run: npm test -- --coverage
        - name: Upload coverage
          uses: codecov/codecov-action@v3
  ```
- [ ] PRでテストが自動実行されることを確認

### Day 24（1h）：リファクタリング + コード整理

- [ ] テストコードの重複排除
- [ ] テストヘルパー関数の作成
- [ ] ファイル構成の見直し
- [ ] README.md 作成

### Day 25（1h）：デプロイ

- [ ] Vercelデプロイ
  - [ ] GitHubリポジトリ連携
  - [ ] 環境変数設定
  - [ ] デプロイ確認
- [ ] 本番環境でのMSW無効化確認

### Day 26（1h）：LT資料作成（1）

- [ ] 構成作成
  - タイトル案:「実務で使えるJest×MSWテスト戦略」
  - アウトライン:
    ```
    1. 自己紹介（30秒）
    2. 今日話すこと（30秒）
    3. なぜMSW？（1分）
    4. MSW v2の基本（2分）
    5. 実践：楽観的更新のテスト（3分）← メインコンテンツ
    6. ハマりポイント3選（2分）
    7. まとめ + リポジトリ紹介（1分）
    ```

### Day 27（1h）：LT資料作成（2）

- [ ] スライド作成
  - [ ] Googleスライド or Slidev で作成
  - [ ] コードは読みやすいフォントサイズで
  - [ ] デモ用のGIF作成（あれば）

### Day 28（1h）：LT発表練習

- [ ] 練習
  - [ ] 一人で通しで練習（タイマー計測）
  - [ ] 10分に収まるよう調整
  - [ ] 想定質問への回答準備

### Day 29（1h）：技術記事ドラフト作成

- [ ] 記事執筆
  - タイトル案:「Next.js + tRPC + MSWで実践的なフロントエンドテストを書く」
  - 構成:
    ```
    1. はじめに（この記事で学べること）
    2. 環境構築
    3. MSW v2の基本
    4. tRPCのテスト戦略
    5. 実践：楽観的更新のテスト
    6. CI/CDとの連携
    7. まとめ
    ```

### Day 30（1h）：最終調整 + 公開準備

- [ ] 最終作業
  - [ ] READMEの最終調整
  - [ ] GitHubリポジトリの公開設定
  - [ ] Zenn記事の下書き保存
  - [ ] LTスライドの最終確認

---

## 📝 学習メモ

### MSWでtRPCをモックする方法

```typescript
// tRPCのリクエスト形式
// Query（GET）:  /api/trpc/article.list?input={}
// Mutation（POST）: /api/trpc/article.create

// レスポンス形式
// { result: { data: { json: [...] } } }

// ハンドラー定義
http.get('/api/trpc/article.list', () => {
  return HttpResponse.json({
    result: { data: { json: mockArticles } },
  })
})

// テストでの上書き
server.use(
  http.get('/api/trpc/article.list', () => {
    return HttpResponse.json({
      result: { data: { json: [] } }, // 空配列を返す
    })
  })
)
```

### テストのベストプラクティス（7原則）

1. **実装の詳細をテストしない** → ユーザー視点でテスト
2. **ユーザーが見るものをテスト** → `getByRole` > `getByTestId`
3. **Arrange-Act-Assert** → 準備・実行・検証を明確に
4. **テストは独立させる** → 状態を共有しない
5. **何をテストすべきか** → ユーザー操作、条件分岐、エッジケース
6. **命名規則** → 「何をしたら」「どうなる」を明記
7. **非同期の待ち方** → `waitFor` or `findBy` を使う

### クエリの優先順位（Testing Library）

| 優先度 | クエリ                 | 用途                       |
| ------ | ---------------------- | -------------------------- |
| 1      | `getByRole`            | ボタン、リンク、見出しなど |
| 2      | `getByLabelText`       | フォーム入力               |
| 3      | `getByPlaceholderText` | プレースホルダーがある入力 |
| 4      | `getByText`            | 非インタラクティブな要素   |
| 5      | `getByTestId`          | 最終手段                   |

---

## 📚 参考リソース

### 公式ドキュメント

- [Jest 公式](https://jestjs.io/docs/getting-started)
- [MSW 公式](https://mswjs.io/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [tRPC Testing](https://trpc.io/docs/client/react/testing)

### おすすめ記事

- Kent C. Dodds - "Testing Implementation Details"
- "The Testing Trophy and Testing Classifications"

### MSW v2 移行

- [MSW v2 Migration Guide](https://mswjs.io/docs/migrations/1.x-to-2.x)

---

## 💡 Tips

### 時間が足りない場合の優先順位

1. **最優先**: ユニットテスト + MSWセットアップ（Day 1-10）
2. **高優先**: 統合テスト（Day 15-20）
3. **中優先**: CI/CD、カバレッジ（Day 22-23）
4. **低優先**: LT資料、記事（Day 26-29）

### モチベーション維持

- 毎日GitHubにcommitする（草を生やす）
- 進捗をTwitter/Xで共有
- 週末に振り返りnoteを書く

---

**🎯 目標：「テストを書くのが楽しくなる」状態になること！**
