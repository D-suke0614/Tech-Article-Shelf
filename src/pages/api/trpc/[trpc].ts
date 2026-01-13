import { appRouter } from '@/lib/server/api/root'
import { createNextApiHandler } from '@trpc/server/adapters/next'
import { createContext } from '@/lib/server/api/trpc/context'

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
          )
        }
      : undefined,
})
