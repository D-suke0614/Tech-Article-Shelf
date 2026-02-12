import { server } from '../msw/server'
import { http, HttpResponse } from 'msw'
import { fetchOgpData } from '.'

describe('fetchOgpData', () => {
  describe('正常系', () => {
    test('OGPからデータを抽出する', async () => {
      // Arrange
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="テスト記事タイトル" />
            <meta property="og:description" content="記事の説明文です" />
            <meta property="og:image" content="https://example.com/image.png" />
            <meta property="og:site_name" content="Example Site" />
          </head>
          <body></body>
        </html>
      `
      server.use(
        http.get('https://example.com/article', () => {
          return new HttpResponse(mockHtml, {
            headers: { 'Content-Type': 'text/html' },
          })
        })
      )
      // Act
      const result = await fetchOgpData('https://example.com/article')

      // Assert
      expect(result).toEqual({
        title: 'テスト記事タイトル',
        description: '記事の説明文です',
        image: 'https://example.com/image.png',
        siteName: 'Example Site',
      })
    })
  })

  describe('異常系', () => {
    it('fetchが失敗した場合はエラーをスローする', async () => {
      server.use(
        http.get('https://example.com/error', () => {
          return HttpResponse.error()
        })
      )

      await expect(fetchOgpData('https://example.com/error')).rejects.toThrow()
    })

    it('404の場合はエラーをスローする', async () => {
      server.use(
        http.get('https://example.com/not-found', () => {
          return new HttpResponse(null, { status: 404 })
        })
      )

      await expect(
        fetchOgpData('https://example.com/not-found')
      ).rejects.toThrow('Failed to fetch OGP data: 404')
    })
  })
})
