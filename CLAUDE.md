# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 14 (Pages Router) ベースのアプリケーション。tRPC、Prisma、React Query、MSWを使用したモダンな開発環境が構築されている。

**注意**: 現在はセットアップ段階で、tRPCルーター、Prismaスキーマ、MSWハンドラーなどの実装はまだ初期段階。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint

# テスト実行
npm test
```

## プロジェクト構造

```
src/
├── components/
│   ├── ui/                    # 汎用UIコンポーネント
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Button.stories.tsx   # ← 同階層に配置
│   │   │   ├── Button.test.tsx      # ← 同階層に配置
│   │   │   └── index.ts
│   │   └── Modal/
│   ├── features/              # ビジネスロジックコンポーネント
│   │   └── article/
│   │       ├── ArticleCard/
│   │       │   ├── ArticleCard.tsx
│   │       │   ├── ArticleCard.stories.tsx
│   │       │   ├── ArticleCard.test.tsx
│   │       │   └── index.ts
│   │       ├── ArticleList/
│   │       ├── ArticleForm/
│   │       └── SearchBar/
│   ├── layouts/               # レイアウトコンポーネント
│   │   └── MainLayout/
│   ├── providers/             # Reactコンテキストプロバイダー
│   └── hooks/                 # カスタムReactフック
│       ├── useCreateArticle/
│       │   ├── index.ts
│       │   └── index.test.ts  # ← 同階層に配置
│       └── useArticleFilter/
├── pages/                     # Next.jsページ
│   ├── index.page.tsx         # ← *.page.tsx 命名規則
│   ├── Home.stories.tsx
│   ├── Home.test.tsx
│   └── api/
│       └── trpc/
│           └── [trpc].ts
├── server/                    # tRPC定義
│   ├── routers/
│   │   ├── _app.ts            # ルーター集約
│   │   ├── article.ts         # 記事ルーター
│   │   └── tag.ts             # タグルーター
│   └── trpc/
│       └── index.ts           # tRPC設定
└── lib/
    ├── client/                # クライアントサイドユーティリティ
    │   └── trpc.ts            # tRPCクライアント設定
    ├── server/                # サーバーサイドユーティリティ
    │   └── api/
    │       ├── article/       # 記事API関連
    │       │   └── msw/
    │       │       ├── index.ts       # ハンドラー定義
    │       │       └── fixture.ts     # モックデータ
    │       ├── ogp/           # OGP取得API関連
    │       │   └── msw/
    │       │       ├── index.ts
    │       │       └── fixture.ts
    │       └── msw/
    │           └── server.ts  # MSWサーバー設定（統合）
    └── shared/                # 共通ユーティリティ
        └── utils/
            ├── url.ts
            └── url.test.ts
```

## 技術スタック

### フロントエンド
- **Next.js 14** (Pages Router)
- **React 18**
- **TypeScript 5**
- **Tailwind CSS**

### バックエンド・API
- **tRPC v11** - 型安全なAPI通信
  - `@trpc/server`: サーバーサイド実装
  - `@trpc/client`: クライアント実装
  - `@trpc/next`: Next.js統合
  - `@trpc/react-query`: React Query統合

### データベース
- **Prisma v7** - ORMとデータベースクライアント

### 状態管理・データフェッチング
- **TanStack Query (React Query) v5** - サーバーステート管理

### テスト
- **Jest 30** - テストランナー
- **Testing Library** - Reactコンポーネントテスト
- **MSW v2** - APIモック

## tRPC実装ガイドライン

このプロジェクトではtRPCを使用して型安全なAPI通信を実現する。

### tRPCルーターの配置
- ルーター定義: `src/lib/server/api/routers/`
- ルート統合: `src/lib/server/api/root.ts` (作成予定)

### tRPCクライアント設定
- クライアント設定: `src/lib/client/trpc.ts` (作成予定)
- `_app.tsx`でtRPC Providerを統合

## テスト方針

### テストファイルの配置
- `**/__tests__/**/*.[jt]s?(x)` または
- `**/?(*.)+(spec|test).[jt]s?(x)`

### MSWによるAPIモック
- MSWサーバー設定: `src/lib/server/api/msw/server.ts`
- APIごとのハンドラー: `src/lib/server/api/{domain}/msw/`
  - `index.ts`: MSWハンドラー定義
  - `fixture.ts`: テストデータ

### テストセットアップ
- `jest.setup.ts`: グローバルセットアップ（MSWサーバーの起動など）
- MSWサーバーは各テストスイートで `beforeAll`、`afterEach`、`afterAll` を使用

## パスエイリアス

`@/` が `src/` にマップされている:

```typescript
import { something } from '@/lib/server/api'
```

## Prismaワークフロー

### 設定ファイル
- **prisma.config.ts**: Prisma v7の設定ファイル（datasource URL、マイグレーションパスなど）
- **prisma/schema.prisma**: データベーススキーマ定義
- **package.json**: `prisma.seed`セクションでシードスクリプトを定義

### 基本コマンド

```bash
# スキーマから型生成
npx prisma generate

# マイグレーション作成（開発環境）
npx prisma migrate dev

# マイグレーション作成（本番環境）
npx prisma migrate deploy

# データベースリセット（全データ削除 + マイグレーション再実行 + シード自動実行）
npx prisma migrate reset

# シードデータ投入
npx prisma db seed

# Prisma Studio起動（データベースGUI）
npx prisma studio
```

### Prisma v7の重要な変更点

1. **datasource.url の廃止**: `schema.prisma`から`url`プロパティを削除し、`prisma.config.ts`で管理
2. **seed設定**: `package.json`の`prisma.seed`が必須（`prisma.config.ts`のみでは不十分）
3. **LibSQL Adapter使用**: `@prisma/adapter-libsql`で軽量なSQLiteベースのDB接続
