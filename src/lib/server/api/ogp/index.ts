import * as cheerio from 'cheerio'
import { isValidUrl } from '@/lib/shared/utils/url'
import type { OgpData } from './types'

/** デフォルトのタイムアウト時間（ミリ秒） */
const DEFAULT_TIMEOUT_MS = 10000

/**
 * プライベートIPアドレスかどうかを判定
 * SSRF対策として内部ネットワークへのアクセスを防ぐ
 */
const isPrivateHost = (hostname: string): boolean => {
  const lowerHostname = hostname.toLowerCase()

  // localhost
  if (lowerHostname === 'localhost') return true

  // IPv6 localhost
  if (lowerHostname === '::1' || lowerHostname === '[::1]') return true

  // 0.0.0.0
  if (lowerHostname === '0.0.0.0') return true

  // IPv4プライベートアドレス
  // 127.x.x.x (loopback)
  if (/^127\./.test(lowerHostname)) return true

  // 10.x.x.x (Class A private)
  if (/^10\./.test(lowerHostname)) return true

  // 172.16.x.x - 172.31.x.x (Class B private)
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lowerHostname)) return true

  // 192.168.x.x (Class C private)
  if (/^192\.168\./.test(lowerHostname)) return true

  // 169.254.x.x (link-local, AWS metadata endpoint)
  if (/^169\.254\./.test(lowerHostname)) return true

  return false
}

export const fetchOgpData = async (url: string): Promise<OgpData> => {
  // URL形式の検証（http/httpsのみ許可）
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL format')
  }

  // SSRF対策：プライベートIPアドレスへのアクセスを禁止
  const parsedUrl = new URL(url)
  if (isPrivateHost(parsedUrl.hostname)) {
    throw new Error('Access to private IP addresses is not allowed')
  }

  // タイムアウト設定
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`Failed to fetch OGP data: ${res.status}`)
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    // OGPメタタグから抽出
    const ogTitle = $('meta[property="og:title"]').attr('content')
    const ogDescription = $('meta[property="og:description"]').attr('content')
    const ogImage = $('meta[property="og:image"]').attr('content')
    const ogSiteName = $('meta[property="og:site_name"]').attr('content')

    // フォールバック
    const title = ogTitle || $('title').text() || ''
    const description =
      ogDescription || $('meta[name="description"]').attr('content') || ''

    return {
      title: title.trim(),
      description: description.trim(),
      image: ogImage || '',
      siteName: ogSiteName || '',
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}
// 型のre-export
export type { OgpData } from './types'
