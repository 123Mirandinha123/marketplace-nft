import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

import { sessionRequest } from './api'
import { sessionQueryKey } from './use-auth'

export async function requireSession(queryClient: QueryClient, href: string) {
  try {
    const user = await queryClient.ensureQueryData({
      queryKey: sessionQueryKey,
      queryFn: sessionRequest,
    })

    if (!user) {
      throw new Error('No active session')
    }

    return user
  } catch {
    throw redirect({
      to: '/login',
      search: { redirect: href },
    })
  }
}
