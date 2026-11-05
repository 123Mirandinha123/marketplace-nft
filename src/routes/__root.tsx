import type { QueryClient } from '@tanstack/react-query'
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const hideMobileHeader =
    pathname === '/' ||
    pathname.startsWith('/nft/') ||
    pathname === '/carrinho' ||
    pathname === '/pagamento' ||
    pathname === '/confirmacao'
  const showTabBar =
    pathname === '/' ||
    pathname === '/mercado' ||
    pathname === '/perfil' ||
    pathname === '/carteiras'

  return (
    <div className="flex min-h-svh w-full max-w-full flex-col overflow-x-hidden">
      <div className={cn(hideMobileHeader && 'hidden md:block')}>
        <Header />
      </div>
      <main className={cn('flex-1', showTabBar && 'pb-[98px] md:pb-0')}>
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      {showTabBar ? <MobileTabBar /> : null}
    </div>
  )
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="kurio-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs tracking-[0.2em] text-primary uppercase">
        Algo deu errado
      </p>
      <h1 className="mt-3 text-3xl font-bold text-cream">
        Não foi possível carregar esta página
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-tan">
        {error instanceof Error
          ? error.message
          : 'Tente novamente em instantes.'}
      </p>
      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={reset}>
          Tentar novamente
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="kurio-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs tracking-[0.2em] text-primary uppercase">
        Erro 404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-cream">
        Essa página não existe
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-tan">
        O endereço pode ter mudado ou o conteúdo ainda não faz parte desta
        versão da Kurio.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
