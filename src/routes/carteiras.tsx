import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '@/features/auth/require-session'
import { WalletsPage } from '@/features/profile/wallets-page'

export const Route = createFileRoute('/carteiras')({
  beforeLoad: async ({ context, location }) => {
    await requireSession(context.queryClient, location.href)
  },
  component: WalletsPage,
})
