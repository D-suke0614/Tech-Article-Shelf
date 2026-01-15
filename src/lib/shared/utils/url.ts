export const isValidUrl = (url: string): boolean => {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export const extractDomain = (url: string): string => {
  if (!isValidUrl(url)) return ''

  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return ''
  }
}

export const normalizeUrl = (url: string): string => {
  if (!isValidUrl(url)) return url

  const trimmedUrl = url.trim()
  try {
    const parsed = new URL(trimmedUrl)
    let slicedPath = parsed.pathname
    if (parsed.pathname.endsWith('/')) {
      slicedPath = parsed.pathname.slice(0, -1)
    }
    return `${parsed.protocol}//${parsed.host}${slicedPath}${parsed.search}${parsed.hash}`
  } catch {
    return trimmedUrl
  }
}
