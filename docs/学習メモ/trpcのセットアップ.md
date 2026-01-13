## 各ファイルの役割

1. context.ts 「各リクエストで共有する情報」
   1. 各Procedureで使いたい情報（DB接続、認証情報など）を定義
      1. `createContext`はリクエストごとに呼ばれる
      2. 返り値が各Procedureの`ctx`として渡される
      3. `Context`型をエクスポートして他ファイルで使う
2. trpc.ts 「tPRCの初期化と部品作成」
   1. tRPCを初期化し、router/procedureの型付き部品を作成
      1. `superjson`：DateオブジェクトをJSONで正しく送受信するため
      2. `publicProcedure`：認証不要のエンドポイント用
      3. 認証が必要であれば`protectedProcedure`を別途作成
3. article.ts 「実際のAPIロジック」
   1. 記事に関するCRUD操作を定義
      1. query：GET相当でキャッシュされる
      2. mutation：POST, PUT, DELETE相当でキャッシュされない
4. root.ts 「ルーターの統合」
   1. 複数のルーターを１つにまとめる
      1. ルーターを追加する場合はここに登録
      2. `AppRouter`型をexportしており、クライアント側で型補完のために必須
5. [trpc].ts Next.jsとの接続点
   1. tRPCをNext.js API Routeとして公開
      1. [trpc]はDynamic Routes - `/api/trpc/article.list`など全てを受け入れる

## データの流れ

1. ブラウザ: GET /api/trpc/article.list
   ↓
2. [trpc].ts: createNextApiHandler が受け取る
   ↓
3. context.ts: createContext() で { prisma, req, res } 作成
   ↓
4. root.ts: appRouter から article.list を探す
   ↓
5. article.ts: list procedure が実行される
   ↓
6. Prisma: DBから記事一覧を取得
   ↓
7. superjson: Dateをシリアライズ
   ↓
8. ブラウザ: JSONレスポンス受信

## Prismaのメソッドについて

`findUnique`と`findUniqueOrThrow`の違いについて
`findUnique`：対象がなければnullを返す。「ないかもしれない」が正常なケースで使用
`findUniqueOrThrow`：対象がなければ例外をスロー。「あるはず」が正常なケースで使用
