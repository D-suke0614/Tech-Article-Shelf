# Next.js + tRPC + MSWで実践的なフロントエンドテストを書く

## はじめに

この記事では、Next.js + tRPC + MSW v2 を組み合わせた実践的なフロントエンドテスト戦略を解説します。

特に以下のポイントに焦点を当てます：

- MSW v2 での tRPC APIモックの実装方法
- 楽観的更新（Optimistic Updates）のテスト手法
- Jest + Testing Library の実践的なパターン

対象読者：

- Reactのテストに興味があるフロントエンドエンジニア
- MSW v2 を使ったことがない方
- tRPC のテスト方法を探している方

---

## 環境構築

### 技術スタック

```
Next.js 14 (Pages Router)
TypeScript 5
tRPC v11
MSW v2
Jest 30
@testing-library/react
```

### Jestセットアップのポイント

Node.js環境でFetch APIが使えない問題を `undici` で解決します：

```typescript
// jest.setup.ts
import { fetch, Request, Response, Headers } from 'undici'
import { TextEncoder, TextDecoder } from 'util'

global.fetch = fetch as unknown as typeof globalThis.fetch
global.Request = Request as unknown as typeof globalThis.Request
global.Response = Response as unknown as typeof globalThis.Response
global.Headers = Headers as unknown as typeof globalThis.Headers
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder
```

### MSWサーバーセットアップ

```typescript
// jest.setup.ts（続き）
import { server } from './src/lib/server/api/msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## MSW v2の基本

### tRPCのリクエスト形式を理解する

tRPCのHTTPリクエストには独特の形式があります：

```
# Query (GET)
GET /api/trpc/article.list?input={"json":null}

# Mutation (POST)
POST /api/trpc/article.create
Body: {"0": {"json": {...}, "meta": {...}}}

# レスポンス形式（superjson対応）
{"result": {"data": {"json": [...], "meta": {...}}}}
```

### MSWハンドラーの実装

```typescript
import { http, HttpResponse } from 'msw'
import superjson from 'superjson'

function createTRPCResponse<T>(data: T) {
  return { result: { data: superjson.serialize(data) } }
}

export const articleHandlers = [
  // Query
  http.get('/api/trpc/article.list', () => {
    return HttpResponse.json(createTRPCResponse(mockArticles))
  }),

  // Mutation
  http.post('/api/trpc/article.create', async ({ request }) => {
    const body = (await request.json()) as { '0': SuperJSONResult }
    const input = superjson.deserialize(body['0'])
    const newArticle = { ...input, id: `article-${Date.now()}` }
    return HttpResponse.json(createTRPCResponse(newArticle))
  }),
]
```

---

## tRPCのテスト戦略

### カスタムフックのテスト

tRPCフックをテストするには、`TRPCProvider` + `QueryClientProvider` のラッパーが必要です：

```typescript
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const trpcClient = createTRPCClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    )
  }

  return { wrapper: Wrapper, queryClient }
}
```

### フックテストの例

```typescript
describe('useCreateArticle', () => {
  it('成功時に article.list キャッシュが無効化される', async () => {
    // Arrange
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateArticle(), { wrapper })

    // Act
    await act(async () => {
      await result.current.createArticle({
        url: 'https://example.com/article',
        title: 'テスト記事',
      })
    })

    // Assert
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
```

---

## 実践：楽観的更新のテスト

### 楽観的更新の実装

```typescript
export function useToggleFavorite() {
  const utils = trpc.useUtils()

  const mutation = trpc.article.toggleFavorite.useMutation({
    onMutate: async (input) => {
      await utils.article.list.cancel()
      const previousData = utils.article.list.getData()

      utils.article.list.setData(undefined, (old) =>
        old?.map((article) =>
          article.id === input.id
            ? { ...article, isFavorite: !input.currentValue }
            : article
        )
      )

      return { previousData }
    },

    onError: (_err, _input, context) => {
      if (context?.previousData) {
        utils.article.list.setData(undefined, context.previousData)
      }
    },

    onSettled: () => {
      utils.article.list.invalidate()
    },
  })

  return {
    toggleFavorite: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
```

### 楽観的更新のテスト

```typescript
describe('useToggleFavorite', () => {
  it('API成功後に invalidate が呼ばれる', async () => {
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useToggleFavorite(), { wrapper })

    act(() => {
      result.current.toggleFavorite({ id: 'article-1', currentValue: true })
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled()
    })
  })

  it('APIエラー時に error が設定される', async () => {
    // MSWでエラーレスポンスをシミュレート
    server.use(
      http.post('/api/trpc/article.toggleFavorite', () => {
        return HttpResponse.json(
          { error: { message: 'Server Error' } },
          { status: 500 }
        )
      })
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useToggleFavorite(), { wrapper })

    act(() => {
      result.current.toggleFavorite({ id: 'article-1', currentValue: true })
    })

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })
  })

  it('遅延レスポンスでもロード状態が適切に変化する', async () => {
    // 100ms遅延レスポンス
    server.use(
      http.post('/api/trpc/article.toggleFavorite', async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({
          result: { data: superjson.serialize(updated) },
        })
      })
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useToggleFavorite(), { wrapper })

    act(() => {
      result.current.toggleFavorite({ id: 'article-1', currentValue: true })
    })

    await waitFor(() => expect(result.current.isLoading).toBe(true))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
```

---

## CI/CDとの連携

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx jest --coverage --ci
      - uses: codecov/codecov-action@v4
```

---

## ハマりポイントと解決策

### 1. Node.js環境でのFetch API

```
ReferenceError: Response is not defined
```

→ `undici` パッケージでPolyfillを設定

### 2. superjsonのESM問題

```
SyntaxError: Cannot use import statement outside a module
```

→ `jest.config.js` の `transformIgnorePatterns` に追加

```javascript
transformIgnorePatterns: [
  '/node_modules/(?!(superjson|copy-anything|is-what)/)',
]
```

### 3. tRPCバッチリクエスト

複数コンポーネントが同じエンドポイントを同時呼び出し → バッチリクエスト化 → MSWが対応できない

→ クライアントサイドフィルタリングで単一クエリに統合

---

## まとめ

MSW v2 + Jest + tRPC の組み合わせにより：

1. **HTTPレベルの実装に近いテスト** が書ける
2. **楽観的更新** のような複雑な状態変化もテスト可能
3. **エラー・遅延のシミュレート** が容易

カバレッジ結果：Statement **84.87%**（96テスト）

> 「テストを書くのが楽しくなる」状態を目指した30日間の成果です。
