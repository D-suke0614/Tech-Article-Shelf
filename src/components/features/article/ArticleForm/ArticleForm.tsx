import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/client/trpc'
import { isValidUrl } from '@/lib/shared/utils/url'
import { useCreateArticle } from '@/components/hooks/useCreateArticle'

type ArticleFormProps = {
  onSuccess?: () => void
}

export function ArticleForm({ onSuccess }: ArticleFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fetchUrl, setFetchUrl] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { createArticle, isLoading, error, reset } = useCreateArticle()

  // URL入力から500ms後にOGP取得をトリガー
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (isValidUrl(url)) {
        setFetchUrl(url)
      } else {
        setFetchUrl('')
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [url])

  const {
    data: ogpData,
    isFetching: isOgpFetching,
    isError: isOgpError,
  } = trpc.article.fetchOgp.useQuery(
    { url: fetchUrl },
    {
      enabled: fetchUrl !== '',
      retry: false,
    }
  )

  // OGPデータ取得後にタイトル・説明を自動入力（ユーザーが未編集の場合）
  useEffect(() => {
    if (!ogpData) return
    if (ogpData.title) setTitle(ogpData.title)
    if (ogpData.description) setDescription(ogpData.description)
  }, [ogpData])

  // URLが変わったらOGPフィールドをリセット
  useEffect(() => {
    setTitle('')
    setDescription('')
    reset()
  }, [url, reset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidUrl(url) || !title.trim()) return

    await createArticle({
      url,
      title: title.trim(),
      description: description.trim() || undefined,
      thumbnail: ogpData?.image || undefined,
    })

    setUrl('')
    setTitle('')
    setDescription('')
    setFetchUrl('')
    onSuccess?.()
  }

  const isSubmitDisabled =
    !isValidUrl(url) || !title.trim() || isLoading || isOgpFetching

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">記事を追加</h2>

      {/* URL入力 */}
      <div className="mb-4">
        <label
          htmlFor="article-url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isOgpFetching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              取得中...
            </span>
          )}
        </div>
        {isOgpError && (
          <p className="mt-1 text-xs text-amber-600">
            OGP情報を取得できませんでした。タイトルを手動で入力してください。
          </p>
        )}
      </div>

      {/* タイトル入力 */}
      <div className="mb-4">
        <label
          htmlFor="article-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事のタイトル"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 説明入力 */}
      <div className="mb-6">
        <label
          htmlFor="article-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          説明
        </label>
        <textarea
          id="article-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="記事の概要（省略可）"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error.message}
        </p>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '追加中...' : '記事を追加'}
      </button>
    </form>
  )
}
