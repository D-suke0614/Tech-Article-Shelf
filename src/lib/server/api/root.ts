import { router } from "./trpc/trpc";
import { articleRouter } from "./routers/article";

export const appRouter = router({
  article: articleRouter
})

export type AppRouter = typeof appRouter
