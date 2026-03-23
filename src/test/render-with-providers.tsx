/**
 * テスト用ユーティリティ
 * TRPCProvider + QueryClientProvider でラップしたレンダリングヘルパー
 */
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, createTRPCClient } from '@/lib/client/trpc'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

type ProvidersProps = {
  children: React.ReactNode
  queryClient?: QueryClient
}

export function TestProviders({ children, queryClient }: ProvidersProps) {
  const client = queryClient ?? createTestQueryClient()
  const trpcClient = createTRPCClient()

  return React.createElement(
    trpc.Provider,
    { client: trpcClient, queryClient: client },
    React.createElement(QueryClientProvider, { client }, children)
  )
}

type RenderWithProvidersOptions = RenderOptions & {
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient, ...options }: RenderWithProvidersOptions = {}
) {
  const client = queryClient ?? createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(TestProviders, { queryClient: client }, children)
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient: client,
  }
}
