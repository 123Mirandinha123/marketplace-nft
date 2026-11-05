import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '@/features/auth/require-session'
import { ProfilePage } from '@/features/profile/profile-page'

export const Route = createFileRoute('/perfil')({
  beforeLoad: async ({ context, location }) => {
    await requireSession(context.queryClient, location.href)
  },
  component: ProfilePage,
})
