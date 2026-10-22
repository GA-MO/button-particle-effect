import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './index'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}
