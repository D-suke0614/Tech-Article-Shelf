import { trpc } from '@/lib/client/trpc'

export function useCreateArticle() {
  const utils = trpc.useUtils()

  const mutation = trpc.article.create.useMutation({
    onSuccess: () => {
      utils.article.list.invalidate()
    },
  })

  return {
    createArticle: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
