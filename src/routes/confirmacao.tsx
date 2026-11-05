import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '@/features/auth/require-session'
import { ConfirmationPage } from '@/features/orders/confirmation-page'

function validateSearch(search: Record<string, unknown>): {
  orderId?: string
} {
  return typeof search.orderId === 'string'
    ? { orderId: search.orderId }
    : {}
}

export const Route = createFileRoute('/confirmacao')({
  validateSearch,
  beforeLoad: async ({ context, location }) => {
    await requireSession(context.queryClient, location.href)
  },
  component: ConfirmationRoute,
})

function ConfirmationRoute() {
  const { orderId } = Route.useSearch()

  return <ConfirmationPage orderId={orderId} />
}
