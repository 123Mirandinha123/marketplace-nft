import { Link, useRouterState } from '@tanstack/react-router'
import { Heart, Home, ShoppingCart, User } from 'lucide-react'

import { useCart } from '@/features/cart/cart-context'

export function MobileTabBar() {
  const { count } = useCart()
  const router = useRouterState()
  const pathname = router.location.pathname

  const isHome = pathname === '/'
  const isProfile = pathname.startsWith('/perfil') || pathname.startsWith('/carteiras')
  const isCart = pathname.startsWith('/carrinho')
  const isFavorites = false

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden pointer-events-none"
    >
      <div className="relative pointer-events-auto flex h-[76px] w-full max-w-[420px] items-center justify-between px-6">
        {/* Fundo escuro com recorte côncavo para o botão central */}
        <div
          className="absolute inset-x-0 bottom-0 top-1 z-0 rounded-t-[32px] bg-[#201511] shadow-[0px_-6px_24px_rgba(0,0,0,0.7)]"
        />

        {/* Lado Esquerdo: Início e Coração */}
        <div className="relative z-10 flex w-28 items-center justify-around">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={`flex flex-col items-center justify-center p-2 transition-transform active:scale-95 ${
              isHome ? 'text-[#d28a4c]' : 'text-sand/70 hover:text-sand'
            }`}
            aria-label="Início"
          >
            <Home className="size-6 fill-current" />
          </Link>

          <Link
            to="/mercado"
            className={`flex flex-col items-center justify-center p-2 transition-transform active:scale-95 ${
              isFavorites ? 'text-[#d28a4c]' : 'text-sand/70 hover:text-sand'
            }`}
            aria-label="Favoritos"
          >
            <Heart className="size-6" />
          </Link>
        </div>

        {/* Botão Central: Círculo Gradiente com o logo/símbolo central */}
        <div className="relative z-20 -top-5 flex items-center justify-center">
          <Link
            to="/mercado"
            className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-[#d28a4c]/90 to-[#b56e34] p-0.5 shadow-[0_6px_20px_rgba(210,138,76,0.4)] transition-transform hover:scale-105 active:scale-95"
            aria-label="Explorar Mercado"
          >
            <div className="flex size-full items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-[#e39c5b] to-[#b87035]">
              {/* Símbolo do Eclipse 39 em SVG limpo */}
              <svg
                viewBox="0 0 24 24"
                className="size-7 text-white/90 drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 6h10a4 4 0 0 1 4 4v1H3v-1a4 4 0 0 1 4-4z" />
                <path d="M3 13h18v1a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-1z" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Lado Direito: Carrinho e Perfil */}
        <div className="relative z-10 flex w-28 items-center justify-around">
          <Link
            to="/carrinho"
            className={`relative flex flex-col items-center justify-center p-2 transition-transform active:scale-95 ${
              isCart ? 'text-[#d28a4c]' : 'text-sand/70 hover:text-sand'
            }`}
            aria-label="Carrinho de compras"
          >
            <ShoppingCart className="size-6" />
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-[#d28a4c] text-[9px] font-bold text-ink">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          <Link
            to="/perfil"
            className={`flex flex-col items-center justify-center p-2 transition-transform active:scale-95 ${
              isProfile ? 'text-[#d28a4c]' : 'text-sand/70 hover:text-sand'
            }`}
            aria-label="Meu perfil"
          >
            <User className="size-6" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
