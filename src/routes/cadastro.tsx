import { createFileRoute, redirect } from '@tanstack/react-router'

function buildAuthUrl(mode: string, redirectTo?: string) {
  const params = new URLSearchParams({ auth: mode })
  if (redirectTo) params.set('redirect', redirectTo)
  return `/?${params.toString()}`
}

export const Route = createFileRoute('/cadastro')({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ href: buildAuthUrl('cadastro', search.redirect), replace: true })
  },
})
