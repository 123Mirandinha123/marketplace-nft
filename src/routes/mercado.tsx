import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mercado')({
  beforeLoad: () => {
    throw redirect({
      to: '/',
      hash: 'catalogo',
    })
  },
})
