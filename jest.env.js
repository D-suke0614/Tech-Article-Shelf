/* eslint-disable @typescript-eslint/no-require-imports */
const JSDOMEnvironment = require('jest-environment-jsdom').default

/**
 * カスタムJest環境
 * jsdom環境にNode.jsのfetch APIを追加する
 * MSW v2がfetch APIを必要とするため
 */
class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args)

    // Node.js 18+のグローバルfetch APIをjsdom環境に追加
    this.global.fetch = fetch
    this.global.Headers = Headers
    this.global.Request = Request
    this.global.Response = Response
    this.global.ReadableStream = ReadableStream
    this.global.WritableStream = WritableStream
    this.global.TransformStream = TransformStream
    this.global.BroadcastChannel = BroadcastChannel
    // AbortController/AbortSignalもNode.jsのものを使用（MSW v2互換性のため）
    this.global.AbortController = AbortController
    this.global.AbortSignal = AbortSignal
  }
}

module.exports = CustomJSDOMEnvironment
