import { setupServer } from 'msw/node'
import { articleHandlers } from '../article/msw'

export const server = setupServer(...articleHandlers)
