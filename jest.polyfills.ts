// Jest Polyfills
// このファイルはsetupFilesで読み込まれ、setupFilesAfterEnvより先に実行される

import { TextEncoder, TextDecoder } from 'util'

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
})
