import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/features/cart/cart-provider'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
      <Toaster />
    </QueryClientProvider>
  )
}
