import { trpc } from '@/lib/client/trpc'

export function useToggleFavorite() {
  const utils = trpc.useUtils()

  const mutation = trpc.article.toggleFavorite.useMutation({
    onMutate: async (input) => {
      // 進行中のクエリをキャンセル（競合防止）
      await utils.article.list.cancel()

      // 現在のキャッシュを保存（ロールバック用）
      const previousData = utils.article.list.getData()

      // キャッシュを即時更新（楽観的更新）
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
      // エラー時はキャッシュをロールバック
      if (context?.previousData) {
        utils.article.list.setData(undefined, context.previousData)
      }
    },

    onSettled: () => {
      // 成功・失敗に関わらずキャッシュを再検証
      utils.article.list.invalidate()
    },
  })

  return {
    toggleFavorite: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
