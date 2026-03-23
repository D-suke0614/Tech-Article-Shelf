import { z } from 'zod'
import { router, publicProcedure } from '../trpc/trpc'
import { fetchOgpData } from '../ogp'

// todo: 認証機能を実装する際に、適切にprocedureを使い分けるようにする
// todo: エラーハンドリングの実装

export const articleRouter = router({
  // 記事一取得
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.article.findMany({
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // 記事作成
  create: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
        title: z.string().min(1),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.article.create({
        data: input,
      })
    }),

  // 既読 / 未読トグル
  toggleRead: publicProcedure
    .input(
      z.object({
        id: z.string(),
        currentValue: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.article.update({
        where: { id: input.id },
        data: { isRead: !input.currentValue },
      })
    }),

  // OGPデータ取得
  fetchOgp: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      return fetchOgpData(input.url)
    }),

  // お気に入りトグル
  toggleFavorite: publicProcedure
    .input(
      z.object({
        id: z.string(),
        currentValue: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.article.update({
        where: { id: input.id },
        data: { isFavorite: !input.currentValue },
      })
    }),
})
