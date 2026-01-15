import { isValidUrl, extractDomain, normalizeUrl } from './url'

describe('isValidUrl', () => {
  describe('有効なURLの場合', () => {
    test('https URLでtrueを返す', () => {
      expect(isValidUrl('https://sample.com')).toBe(true)
    })
    test('http URLでtrueを返す', () => {
      expect(isValidUrl('http://sample.com')).toBe(true)
    })
    test('パス付き URLでtrueを返す', () => {
      expect(isValidUrl('http://sample.com/test/1')).toBe(true)
    })
    test('query URLでtrueを返す', () => {
      expect(isValidUrl('http://sample.com?foo=bar&hoge=1')).toBe(true)
    })
  })

  describe('無効なURLの場合', () => {
    test('空文字でfalseを返す', () => {
      expect(isValidUrl('')).toBe(false)
    })
    test('ただの文字列でfalseを返す', () => {
      expect(isValidUrl('test')).toBe(false)
    })
    test('プロトコルなしでfalseを返す', () => {
      expect(isValidUrl('sample.com')).toBe(false)
    })
    test('fptプロトコルでfalseを返す（http/httpsのみ許可）', () => {
      expect(isValidUrl('ftp://sample.com')).toBe(false)
    })
  })
})

describe('extractDomain', () => {
  describe('正常系', () => {
    test('URLからドメインを抽出する', () => {
      expect(extractDomain('https://sample.com')).toBe('sample.com')
    })
    test('サブドメイン付きURLからドメインを抽出する', () => {
      expect(extractDomain('https://blog.example.com')).toBe('blog.example.com')
    })

    test('ポート番号付きURLからドメインを抽出する', () => {
      expect(extractDomain('http://localhost:3000')).toBe('localhost')
    })

    test('クエリパラメータを除外してドメインを抽出する', () => {
      expect(extractDomain('https://example.com?foo=bar')).toBe('example.com')
    })
  })

  describe('異常系', () => {
    test('無効なURLの場合は、空文字を返す', () => {
      expect(extractDomain('test')).toBe('')
    })
    test('空文字の場合は、空文字を返す', () => {
      expect(extractDomain('')).toBe('')
    })
  })
})

describe('normalizeUrl', () => {
  describe('正常系', () => {
    test('末尾のスラッシュを削除する', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
    })

    test('末尾のスラッシュがなければそのまま返す', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    })

    test('パス末尾のスラッシュを削除する', () => {
      expect(normalizeUrl('https://example.com/path/')).toBe(
        'https://example.com/path'
      )
    })

    test('クエリパラメータを保持する', () => {
      expect(normalizeUrl('https://example.com/path?foo=bar')).toBe(
        'https://example.com/path?foo=bar'
      )
    })

    test('フラグメントを保持する', () => {
      expect(normalizeUrl('https://example.com/path#section')).toBe(
        'https://example.com/path#section'
      )
    })

    test('前後の空白をトリムする', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe(
        'https://example.com'
      )
    })
  })

  describe('異常系', () => {
    test('無効なURLの場合はそのまま返す', () => {
      expect(normalizeUrl('not-a-url')).toBe('not-a-url')
    })

    test('空文字の場合は空文字を返す', () => {
      expect(normalizeUrl('')).toBe('')
    })
  })
})
