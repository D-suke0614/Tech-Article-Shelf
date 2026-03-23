# 実務で使えるJest×MSWテスト戦略

---

## スライド 1: タイトル

**実務で使えるJest×MSWテスト戦略**

〜 tRPC + Next.js 環境でのフロントエンドテスト実践 〜

---

## スライド 2: 自己紹介（30秒）

- フロントエンドエンジニア
- 30日間でJest×MSWのテスト戦略を習得
- 今日話すこと：**「テストを書くのが楽しくなる」ための実践知**

---

## スライド 3: なぜMSW？（1分）

### 従来のAPIモックの問題

```typescript
// ❌ 関数モック - 実装詳細に依存
jest.mock('@/lib/api', () => ({
  fetchArticles: jest.fn().mockResolvedValue([...])
}))
```

### MSWのアプローチ

```typescript
// ✅ HTTPレベルでインターセプト - 実際のリクエストをテスト
server.use(
  http.get('/api/trpc/article.list', () => {
    return HttpResponse.json({
      result: { data: superjson.serialize(articles) },
    })
  })
)
```

**ポイント**: MSWはService WorkerでHTTP通信をインターセプトするため、
実際のネットワークリクエストと同じ経路をテストできる。

---

## スライド 4: MSW v2の基本（2分）

### セットアップ

```typescript
// jest.setup.ts
import { server } from './src/lib/server/api/msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### ハンドラー定義

```typescript
// tRPC Query (GET)
http.get('/api/trpc/article.list', () => {
  return HttpResponse.json({
    result: { data: superjson.serialize(mockArticles) },
  })
})

// tRPC Mutation (POST)
http.post('/api/trpc/article.create', async ({ request }) => {
  const body = await request.json()
  const input = superjson.deserialize(body['0'])
  // ...
})
```

### テスト内でのオーバーライド

```typescript
server.use(
  http.get('/api/trpc/article.list', () => {
    return HttpResponse.json({ result: { data: superjson.serialize([]) } })
  })
)
```

---

## スライド 5: 実践 - 楽観的更新のテスト（3分）★メイン

### 楽観的更新とは？

```
ユーザー操作 → UIを即時更新 → API呼び出し
                              ↓ 成功: そのまま維持
                              ↓ 失敗: 元の状態にロールバック
```

### 実装（useToggleFavorite）

```typescript
const mutation = trpc.article.toggleFavorite.useMutation({
  onMutate: async (input) => {
    await utils.article.list.cancel() // 競合防止
    const previousData = utils.article.list.getData() // バックアップ

    // 即時更新
    utils.article.list.setData(undefined, (old) =>
      old?.map((a) =>
        a.id === input.id ? { ...a, isFavorite: !input.currentValue } : a
      )
    )
    return { previousData }
  },
  onError: (_err, _input, context) => {
    // ロールバック
    utils.article.list.setData(undefined, context?.previousData)
  },
  onSettled: () => utils.article.list.invalidate(),
})
```

### テスト

```typescript
it('遅延レスポンスでも最終的に isLoading が false になる', async () => {
  // Arrange: 100ms遅延
  server.use(
    http.post('/api/trpc/article.toggleFavorite', async () => {
      await new Promise((r) => setTimeout(r, 100))
      return HttpResponse.json({
        result: { data: superjson.serialize(updated) },
      })
    })
  )

  act(() => {
    result.current.toggleFavorite({ id: 'article-1', currentValue: true })
  })

  await waitFor(() => {
    expect(result.current.isLoading).toBe(true)
  }) // ロード中
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  }) // 完了
})
```

---

## スライド 6: ハマりポイント3選（2分）

### 1. undiciのPolyfill

```
ReferenceError: Response is not defined
```

```typescript
// jest.setup.ts に追加
import { fetch, Request, Response, Headers } from 'undici'
global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers
```

### 2. tRPCのバッチリクエスト

同じエンドポイントを複数コンポーネントが同時呼び出し → バッチ化 → MSWが対応できない

**解決策**: クライアントサイドフィルタリングで単一クエリに統合

### 3. superjsonのtransformIgnorePatterns

```
SyntaxError: Cannot use import statement
```

```javascript
// jest.config.js
transformIgnorePatterns: [
  '/node_modules/(?!(superjson|copy-anything|is-what)/)',
]
```

---

## スライド 7: まとめ + リポジトリ紹介（1分）

### 今日のポイント

1. **MSWはHTTPレベルのモック** → 実装詳細に依存しない
2. **tRPCテストのポイント** → superjsonのシリアライズ形式を理解する
3. **楽観的更新テスト** → MSWで遅延・エラーをシミュレートする

### 数字で振り返り

- テスト数: **96テスト**
- カバレッジ: **Statement 84.87%**（目標80%）
- 期間: **30日間（1日1時間）**

### リポジトリ

[GitHub: Tech Article Shelf]

**「テストを書くのが楽しくなった！」**

---

## 補足: テストの7原則

1. 実装の詳細をテストしない
2. ユーザーが見るものをテスト（`getByRole` > `getByTestId`）
3. Arrange-Act-Assert パターン
4. テストは独立させる
5. ユーザー操作・条件分岐・エッジケースをテスト
6. 命名規則: 「何をしたら」「どうなる」
7. 非同期は `waitFor` / `findBy` を使う
