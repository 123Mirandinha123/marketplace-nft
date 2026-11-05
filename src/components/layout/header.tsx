import { Link, useLocation, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  ChevronDown,
  LogOut,
  Search,
  ShoppingCart,
  UserRound,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/features/cart/cart-context'
import { useLogout, useSession } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'

const futureItems = ['Criadores', 'Aprenda']

export function Header() {
  const { data: user, isLoading } = useSession()
  const { count } = useCart()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  function showComingSoon(label: string) {
    toast.info(`${label} estará disponível em uma próxima fase.`)
  }

  function handleNavigateToCatalog(event: React.MouseEvent) {
    if (location.pathname === '/') {
      event.preventDefault()
      const el = document.getElementById('catalogo')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      event.preventDefault()
      navigate({ to: '/' }).then(() => {
        setTimeout(() => {
          document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      })
    }
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success('Você saiu da sua conta.')
        navigate({ to: '/' })
      },
      onError: () => {
        toast.error('Não foi possível encerrar a sessão.')
      },
    })
  }

  return (
    <header className="bg-background pt-6">
      <div className="mx-auto hidden h-[45px] w-full max-w-[1200px] items-start justify-between border-b border-primary/30 px-4 sm:px-6 md:flex xl:px-0">
        <div className="flex h-[45px] w-auto items-start pt-[8px] lg:w-[160px]">
          <Link
            to="/"
            className="rounded-[3px] font-mono text-[14px] leading-[18px] font-bold tracking-[0.1em] text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Kurio, página inicial"
          >
            KURIO
          </Link>
        </div>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex h-[45px] items-start gap-6 lg:gap-10">
            <li className="h-[45px]">
              <Link
                to="/"
                className={cn(
                  'flex h-[45px] flex-col justify-between font-mono text-[16px] leading-[21px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  pathname === '/'
                    ? 'font-bold text-highlight'
                    : 'font-normal text-foreground hover:text-highlight',
                )}
              >
                <span>Início</span>
                {pathname === '/' ? (
                  <span
                    aria-hidden="true"
                    className="w-full border-b-[3px] border-primary"
                  />
                ) : null}
              </Link>
            </li>
            <li className="h-[45px]">
              <a
                href="#catalogo"
                onClick={handleNavigateToCatalog}
                className="flex h-[45px] flex-col justify-between font-mono text-[16px] leading-[21px] font-normal text-foreground transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span>Mercado</span>
              </a>
            </li>
            {futureItems.map((label) => (
              <li key={label} className="h-[45px]">
                <button
                  type="button"
                  title={`${label} — em breve`}
                  className="inline-flex font-mono text-[16px] leading-[21px] font-normal text-foreground transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => showComingSoon(label)}
                >
                  {label}
                  <span className="sr-only"> (em breve)</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex h-[35px] items-center justify-end gap-2 md:gap-4 xl:w-[207px] xl:gap-7">
          <button
            type="button"
            aria-label="Buscar NFTs (em breve)"
            title="Busca — em breve"
            onClick={() => showComingSoon('Busca')}
            className="inline-flex size-5 items-center justify-center text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Search className="size-5" />
          </button>

          <Link
            to="/carrinho"
            className="relative inline-flex items-center text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
          >
            <ShoppingCart className="size-6" />
            {count > 0 ? (
              <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {count > 9 ? '9+' : count}
              </span>
            ) : null}
          </Link>

          {isLoading ? (
            <div className="h-[35px] w-[100px] animate-pulse rounded-[6px] bg-card" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-[35px] items-center gap-2 rounded-[6px] border border-line bg-surface px-2.5 font-mono text-sm text-foreground transition-colors hover:border-primary/50"
                >
                  <Avatar className="size-5 border-0">
                    <AvatarFallback className="text-xs">
                      {user.displayName.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-24 truncate sm:block">
                    {user.displayName}
                  </span>
                  <ChevronDown className="size-3 text-sand" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <span className="block truncate text-foreground">
                    {user.displayName}
                  </span>
                  <span className="block truncate font-normal text-sand">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil">
                    <UserRound className="size-4" />
                    Meu perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/carteiras">
                    <Wallet className="size-4" />
                    Carteiras
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={handleLogout}
                  disabled={logout.isPending}
                >
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/"
              search={{ auth: 'login' }}
              className="hidden h-[35px] w-[100px] cursor-pointer items-center justify-center gap-1.5 rounded-[6px] bg-primary font-mono text-[16px] leading-[21px] font-medium text-ink shadow-button transition-colors hover:bg-highlight md:inline-flex"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      <div className="flex h-16 items-center justify-between px-6 md:hidden">
        <Link
          to="/"
          className="font-mono text-sm leading-[18px] font-bold tracking-[0.1em] text-cream"
          aria-label="Kurio — página inicial"
        >
          KURIO
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/carrinho"
            className="relative flex size-10 items-center justify-center rounded-md text-cream"
            aria-label="Carrinho"
          >
            <ShoppingCart className="size-6" />
            {count > 0 ? (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {count > 9 ? '9+' : count}
              </span>
            ) : null}
          </Link>
          {user ? (
            <Link
              to="/perfil"
              className="flex size-10 items-center justify-center rounded-md text-cream"
              aria-label="Meu perfil"
            >
              <UserRound className="size-5" />
            </Link>
          ) : (
            <Link
              to="/"
              search={{ auth: 'login' }}
              className="flex size-10 items-center justify-center rounded-md text-cream"
              aria-label="Entrar"
            >
              <UserRound className="size-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
