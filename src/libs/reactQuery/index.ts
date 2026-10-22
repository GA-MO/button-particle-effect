import { QueryClient } from '@tanstack/react-query'

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: false,
          refetchOnWindowFocus: false
        }
      }
    })
  }
  return browserQueryClient
}
