'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,      // data stays fresh for 1 min — won't refetch on remount
        gcTime: 5 * 60_000,     // keep in memory 5 min after all subscribers unmount
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
