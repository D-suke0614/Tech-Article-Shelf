import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

const main = async () => {
  // 既存データの削除
  await prisma.article.deleteMany()
  await prisma.tag.deleteMany()

  // タグを作成
  const reactTag = await prisma.tag.create({
    data: { name: 'React' },
  })
  const nextTag = await prisma.tag.create({
    data: { name: 'Next.js' },
  })
  const testTag = await prisma.tag.create({
    data: { name: 'Test' },
  })

  // 記事を作成
  await prisma.article.createMany({
    data: [
      {
        url: 'https://example.com/react-hooks',
        title: 'React Hooksの完全ガイド',
        description: 'useStateからuseEffectまで、hooksの基本を解説',
        isRead: true,
        isFavorite: true,
      },
      {
        url: 'https://example.com/nextjs-app-router',
        title: 'Next.js App Router入門',
        description: 'App Routerの基本的な使い方を学ぶ',
        isRead: false,
        isFavorite: false,
      },
      {
        url: 'https://example.com/jest-msw',
        title: 'Jest + MSWで始めるAPIテスト',
        description: 'MSW v2を使ったモダンなテスト手法',
        isRead: false,
        isFavorite: true,
      },
      {
        url: 'https://example.com/typescript-tips',
        title: 'TypeScript実践Tips 10選',
        description: '現場で使える実践的なテクニック集',
        isRead: true,
        isFavorite: false,
      },
      {
        url: 'https://example.com/testing-library',
        title: 'Testing Libraryベストプラクティス',
        description: 'ユーザー視点のテストを書くコツ',
        isRead: false,
        isFavorite: false,
      },
    ],
  })

  // 記事とタグの紐付け
  const articles = await prisma.article.findMany()

  await prisma.article.update({
    where: { id: articles[0].id },
    data: { tags: { connect: [{ id: nextTag.id }, { id: reactTag.id }] } },
  })

  await prisma.article.update({
    where: { id: articles[1].id },
    data: { tags: { connect: [{ id: nextTag.id }, { id: reactTag.id }] } },
  })

  await prisma.article.update({
    where: { id: articles[2].id },
    data: { tags: { connect: [{ id: testTag.id }] } },
  })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
