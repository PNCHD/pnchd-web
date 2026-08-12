import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import { RepositoryProvider } from './data/RepositoryProvider'
import { AppRoutes } from './routing/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Supabase errors are mostly permission or not-found, which retrying
      // won't fix. One retry covers a transient network blip.
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RepositoryProvider>
    </QueryClientProvider>
  )
}

export default App
