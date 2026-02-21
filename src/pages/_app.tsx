import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { TRPCProvider } from '@/components/providers/TRPCProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TRPCProvider>
      <Component {...pageProps} />
    </TRPCProvider>
  )
}
