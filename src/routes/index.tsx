import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { HomePage } from '@/features/home/home-page'
import { AuthModal } from '@/features/auth/auth-page'

const authSearchSchema = z.object({
  auth: z.enum(['login', 'cadastro']).optional().catch(undefined),
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/')({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: HomeRoute,
})

function HomeRoute() {
  const { auth, redirect } = Route.useSearch()

  return (
    <>
      <HomePage />
      {auth ? (
        <AuthModal
          open={Boolean(auth)}
          mode={auth === 'cadastro' ? 'register' : 'login'}
          redirectTo={redirect}
        />
      ) : null}
    </>
  )
}
