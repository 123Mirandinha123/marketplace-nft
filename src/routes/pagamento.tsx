import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '@/features/auth/require-session'
import { PaymentPage } from '@/features/checkout/payment-page'

export const Route = createFileRoute('/pagamento')({
  beforeLoad: async ({ context, location }) => {
    await requireSession(context.queryClient, location.href)
  },
  component: PaymentPage,
})
