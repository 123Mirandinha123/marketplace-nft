import { Link } from '@tanstack/react-router'
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { useCart } from '@/features/cart/cart-context'
import { NftArtwork } from '@/features/nfts/nft-artwork'
import { useNfts } from '@/features/nfts/use-nfts'
import { formatEth } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Nft } from '@/types/api'

const PAGE_SIZE = 5

function RelatedCard({ nft }: { nft: Nft }) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      className="group flex flex-col gap-2 lg:w-[219px]"
    >
      <div className="flex h-[255px] w-full items-center justify-center rounded-[17px] bg-surface-card p-2 transition-transform group-hover:scale-[1.02]">
        <NftArtwork
          nft={nft}
          className="size-[212px] max-h-full max-w-full rounded-[15px]"
        />
      </div>
      <div className="flex flex-col gap-1 font-mono pt-1">
        <p className="truncate text-[15px] leading-5 text-foreground transition-colors group-hover:text-primary">
          {nft.title}
        </p>
        <p className="text-[16px] leading-4 font-bold text-highlight">
          {formatEth(nft.priceEth)}
        </p>
      </div>
    </Link>
  )
}

export function CartPage() {
  const {
    items,
    totals,
    promoCode,
    setQuantity,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
  } = useCart()
  const { data: related } = useNfts({ pageSize: 15 })
  const [promoInput, setPromoInput] = useState('')
  const [carouselPage, setCarouselPage] = useState(0)
  const [isDeleteMode, setIsDeleteMode] = useState(false)

  const unselectedItems = (related?.items ?? []).filter(
    (item) => !items.some((cartItem) => cartItem.nftId === item.id),
  )
  const totalPages = Math.max(1, Math.ceil(unselectedItems.length / PAGE_SIZE))
  const safePage = Math.min(carouselPage, totalPages - 1)
  const currentRelatedSlice = unselectedItems.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  )

  function handlePromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!promoInput.trim()) {
      toast.error('Digite um código promocional.')
      return
    }

    if (applyPromo(promoInput.trim())) {
      toast.success('Código promocional aplicado.')
      setPromoInput('')
      return
    }

    toast.error('Código promocional inválido.')
  }

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (md:flex)                                  */}
      {/* ========================================================= */}
      <div className="mx-auto hidden w-full max-w-[1248px] flex-col gap-[96px] px-4 py-6 sm:px-6 md:flex">
        <section aria-label="Carrinho de NFTs" className="flex w-full flex-col gap-8">
          {items.length > 0 && <h1 className="sr-only">Carrinho de NFTs</h1>}
          <nav
            aria-label="Breadcrumb"
            className="flex h-4 items-center gap-2 font-mono text-[15px] leading-4 font-bold text-foreground"
          >
            <Link to="/" className="transition-colors hover:text-primary">
              Início
            </Link>
            <span className="text-foreground">/</span>
            <Link to="/mercado" className="transition-colors hover:text-primary">
              Mercado
            </Link>
            <span className="text-foreground">/</span>
            <span className="text-foreground">Carrinho</span>
          </nav>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[12px] border border-field bg-surface-card px-6 py-16 text-center">
              <h1 className="font-mono text-2xl font-bold text-foreground">
                Seu carrinho está vazio
              </h1>
              <p className="mt-2 font-mono text-sm text-text-secondary">
                Explore o catálogo e adicione colecionáveis digitais exclusivos.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-[6px] bg-primary px-6 py-2.5 font-mono text-sm font-bold text-ink transition-colors hover:bg-highlight"
              >
                Explorar NFTs
              </Link>
            </div>
          ) : (
            <div className="flex w-full flex-col justify-between gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex w-full flex-1 flex-col gap-3 lg:max-w-[782px]">
                <div className="hidden h-4 w-full items-center justify-between pr-6 font-mono text-[16px] leading-4 sm:flex">
                  <span className="w-[250px] font-bold text-foreground">NFTs</span>
                  <span className="w-[77px] text-center font-medium text-foreground">
                    Preço
                  </span>
                  <span className="w-[75px] text-center font-bold text-foreground">
                    Edições
                  </span>
                  <span className="w-[87px] text-center font-medium text-foreground">
                    Total
                  </span>
                  <span className="w-[24px]" aria-hidden="true" />
                </div>
                <div className="hidden w-full border-b border-primary/30 pt-1 sm:block" />

                <ul className="flex flex-col gap-3">
                  {items.map((item) => {
                    const lineTotal = (
                      Number(item.unitPriceEth) * item.quantity
                    ).toFixed(5).replace(/\.?0+$/, '')

                    return (
                      <li
                        key={item.key}
                        className="flex min-h-[70px] w-full flex-col justify-between rounded-[6px] bg-surface-card p-3 transition-colors sm:h-[70px] sm:flex-row sm:items-center sm:p-0 sm:pr-6"
                      >
                        <div className="flex items-center gap-4 sm:w-[250px]">
                          <img
                            src={item.imageUrl ?? undefined}
                            alt={item.title}
                            className="size-[70px] shrink-0 rounded-[6px] object-cover"
                          />
                          <div className="flex min-w-0 flex-col gap-1.5 font-mono">
                            <Link
                              to="/nft/$nftId"
                              params={{ nftId: item.nftId }}
                              className="truncate text-[16px] leading-4 font-bold text-foreground transition-colors hover:text-primary"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[14px] leading-4 font-normal text-sand">
                              ID do token: #{item.nftId.replace('nft-', '').padStart(4, '0')} · {item.editionName}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between sm:mt-0 sm:contents">
                          <div className="font-mono text-[16px] leading-4 font-bold whitespace-nowrap text-text-secondary sm:w-[77px] sm:text-center">
                            {formatEth(item.unitPriceEth)}
                          </div>
                          <div className="flex h-[30px] items-center justify-center gap-3 sm:w-[75px]">
                            <button
                              type="button"
                              aria-label={`Diminuir quantidade de ${item.title}`}
                              disabled={item.quantity <= 1}
                              onClick={() => setQuantity(item.key, item.quantity - 1)}
                              className="flex h-[30px] w-[20px] cursor-pointer items-center justify-center rounded-[20px] border border-ink bg-primary text-black shadow-[0px_4px_12px_-2px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                            </button>
                            <span className="min-w-[11px] text-center font-mono text-[17px] leading-6 font-normal text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Aumentar quantidade de ${item.title}`}
                              disabled={item.quantity >= item.maxQuantity}
                              onClick={() => setQuantity(item.key, item.quantity + 1)}
                              className="flex h-[30px] w-[20px] cursor-pointer items-center justify-center rounded-[20px] border border-ink bg-primary text-black shadow-[0px_4px_12px_-2px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                            </button>
                          </div>
                          <div className="font-mono text-[16px] leading-4 font-bold whitespace-nowrap text-highlight sm:w-[87px] sm:text-center">
                            {lineTotal} ETH
                          </div>
                          <div className="flex items-center justify-end sm:w-[24px]">
                            <button
                              type="button"
                              aria-label={`Remover ${item.title} do carrinho`}
                              onClick={() => removeItem(item.key)}
                              className="cursor-pointer text-sand transition-colors hover:text-highlight"
                            >
                              <Trash2 className="size-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <aside
                aria-label="Resumo da carteira"
                className="flex w-full flex-col gap-6 lg:w-[332px] lg:shrink-0"
              >
                <div className="flex flex-col gap-3">
                  <h2 className="font-mono text-[18px] leading-4 font-bold text-foreground">
                    Resumo da carteira
                  </h2>
                  <div className="w-full border-b border-primary/30" />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="promo-code-input"
                    className="font-mono text-[14px] leading-4 font-bold text-foreground"
                  >
                    Código promocional
                  </label>
                  {promoCode ? (
                    <div className="flex h-[40px] items-center justify-between rounded-[3px] border border-primary bg-primary/10 px-3 font-mono text-[14px]">
                      <span className="font-bold text-highlight">
                        {promoCode} aplicado
                      </span>
                      <button
                        type="button"
                        onClick={removePromo}
                        className="text-xs text-text-secondary underline hover:text-foreground cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handlePromo}
                      className="flex h-[40px] w-full items-center rounded-[3px] border border-primary"
                    >
                      <input
                        id="promo-code-input"
                        name="promoCode"
                        autoComplete="off"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Digite o código promocional..."
                        className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-[12px] leading-4 text-foreground placeholder:text-sand focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="flex h-[40px] w-[102px] shrink-0 cursor-pointer items-center justify-center rounded-r-[2px] bg-primary font-mono text-[15px] leading-4 font-bold text-ink transition-colors hover:bg-highlight"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}
                </div>

                <div className="flex flex-col gap-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] leading-5 font-normal text-foreground">
                      Subtotal
                    </span>
                    <span className="text-[18px] leading-4 font-normal text-foreground">
                      {totals.subtotalEth} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] leading-5 font-normal text-foreground">
                      Desconto do lançamento
                    </span>
                    <span className="text-[15px] leading-5 font-normal text-foreground">
                      {totals.discountEth === '0'
                        ? '(-) 00.00'
                        : `(-) ${totals.discountEth} ETH`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] leading-5 font-normal text-foreground">
                        Taxa de rede
                      </span>
                      <span className="text-[18px] leading-4 font-normal text-foreground">
                        {totals.networkFeeEth} ETH
                      </span>
                    </div>
                    <span className="text-right text-[12px] leading-4 font-normal text-highlight">
                      Taxa estimada
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[16px] leading-4 font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-[18px] leading-4 font-bold text-highlight">
                      {totals.totalEth} ETH
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <Link
                    to="/pagamento"
                    aria-label="Finalizar compra"
                    className={cn(
                      'flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[3px] bg-primary font-mono text-[15px] leading-4 font-bold text-ink transition-colors hover:bg-highlight',
                      items.length === 0 && 'pointer-events-none cursor-not-allowed opacity-50',
                    )}
                  >
                    Conectar e finalizar
                  </Link>
                  <Link
                    to="/"
                    className="font-mono text-[15px] leading-5 font-normal text-highlight transition-colors hover:underline"
                  >
                    Continuar explorando
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </section>

        {/* Colecionadores também viram */}
        <section aria-labelledby="related-heading" className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2
              id="related-heading"
              className="font-mono text-[17px] leading-4 font-bold text-highlight"
            >
              Colecionadores também viram
            </h2>
            <div className="w-full border-b border-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-[28px]">
            {currentRelatedSlice.map((item) => (
              <RelatedCard key={item.id} nft={item} />
            ))}
          </div>
          {totalPages > 1 && (
            <div
              role="group"
              aria-label="Navegação do carrossel"
              className="flex items-center justify-center gap-2 pt-2"
            >
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselPage(idx)}
                  aria-label={`Ir para a página ${idx + 1} de ${totalPages}`}
                  aria-current={safePage === idx ? 'true' : undefined}
                  className={cn(
                    'size-[12px] cursor-pointer rounded-full transition-colors',
                    safePage === idx ? 'bg-primary' : 'border-[1.3px] border-primary',
                  )}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ========================================================= */}
      {/* MOBILE LAYOUT (md:hidden)                                 */}
      {/* ========================================================= */}
      <div className="flex min-h-[100dvh] w-full flex-1 flex-col justify-between bg-ink pt-8 md:hidden">
        {/* Top Header Bar */}
        <div className="flex w-full flex-col items-center px-4">
          <div className="relative flex h-[48px] w-full max-w-[366px] items-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Voltar"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#201511] text-sand shadow-md transition-transform active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="flex-1 text-center font-mono text-[19px] font-bold text-cream pr-10">
              Carrinho de NFTs
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-7 py-16 text-center">
            <h2 className="font-mono text-xl font-bold text-foreground">
              Seu carrinho está vazio
            </h2>
            <p className="mt-2 font-mono text-sm text-text-secondary">
              Explore o catálogo e adicione colecionáveis digitais exclusivos.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-[50px] w-full max-w-[358px] items-center justify-center rounded-[40px] bg-gradient-to-r from-primary to-highlight font-mono text-sm font-bold text-ink transition-colors"
            >
              Explorar NFTs
            </Link>
          </div>
        ) : (
          <>
            <div className="flex w-full flex-col items-center">
              {/* Delete mode alert banner */}
              {isDeleteMode && (
                <div className="mt-3 flex w-full flex-col items-center px-7">
                  <div className="flex w-full max-w-[358px] items-center justify-between rounded-[10px] border border-primary/40 bg-surface-card px-3.5 py-2">
                    <span className="font-mono text-[13px] text-text-secondary">
                      Modo de exclusão ativo
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart()
                        setIsDeleteMode(false)
                      }}
                      className="cursor-pointer font-mono text-[13px] font-bold text-highlight underline hover:text-foreground"
                    >
                      Limpar tudo
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="mt-3 flex w-full flex-col items-center px-7">
                <div className="flex w-full max-w-[358px] flex-col gap-4">
                  {items.map((item) => {
                    const lineTotal = (
                      Number(item.unitPriceEth) * item.quantity
                    ).toFixed(5).replace(/\.?0+$/, '')

                    return (
                      <div
                        key={item.key}
                        className={cn(
                          'relative flex h-[104px] w-full max-w-[358px] overflow-hidden rounded-[14px] bg-surface-card shadow-[0px_6px_20px_rgba(10,6,4,0.45)] transition-all',
                          isDeleteMode && 'border border-primary/60',
                        )}
                      >
                        <div className="relative size-[104px] shrink-0 overflow-hidden rounded-l-[14px]">
                          <img
                            src={item.imageUrl ?? undefined}
                            alt={item.title}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-[12px] pl-3 pr-2.5 font-mono">
                          <div className="flex flex-col gap-1 pr-8">
                            <Link
                              to="/nft/$nftId"
                              params={{ nftId: item.nftId }}
                              className="truncate text-[15px] font-bold leading-4 text-foreground hover:text-highlight"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[13px] font-normal leading-4 text-text-secondary">
                              Edição: {item.editionName}
                            </span>
                          </div>
                          <div className="text-[17px] font-bold leading-4 text-highlight">
                            {lineTotal} ETH
                          </div>
                        </div>

                        {isDeleteMode ? (
                          <button
                            type="button"
                            aria-label={`Excluir ${item.title} do carrinho`}
                            onClick={() => removeItem(item.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-[34px] cursor-pointer items-center gap-1.5 rounded-full border border-primary bg-surface-raised px-3 font-mono text-[13px] font-bold text-highlight shadow-sm transition-all hover:bg-primary hover:text-ink active:scale-95"
                          >
                            <Trash2 className="size-4" />
                            <span>Excluir</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              aria-label={`Remover ${item.title} do carrinho`}
                              onClick={() => removeItem(item.key)}
                              className="absolute right-3 top-2.5 flex size-7 cursor-pointer items-center justify-center rounded-full border border-field bg-surface-raised text-text-secondary transition-colors hover:border-primary hover:text-highlight active:scale-95"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                            <div className="absolute right-3 bottom-2.5 flex h-[24px] items-center gap-2">
                              <button
                                type="button"
                                aria-label={`Diminuir quantidade de ${item.title}`}
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setQuantity(item.key, item.quantity - 1)
                                  } else {
                                    removeItem(item.key)
                                  }
                                }}
                                className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-field bg-surface-raised transition-colors hover:border-text-secondary"
                              >
                                {item.quantity <= 1 ? (
                                  <Trash2 className="size-3 text-text-secondary" />
                                ) : (
                                  <Minus className="size-3 text-foreground" />
                                )}
                              </button>
                              <span className="min-w-[12px] text-center font-mono text-[15px] font-medium leading-[20px] text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Aumentar quantidade de ${item.title}`}
                                disabled={item.quantity >= item.maxQuantity}
                                onClick={() => {
                                  const next = Math.min(item.maxQuantity, item.quantity + 1)
                                  setQuantity(item.key, next)
                                }}
                                className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-field bg-surface-raised transition-colors hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Plus className="size-3 text-foreground" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Rounded Sheet with Coupon & Totals */}
            <div className="mt-8 flex flex-1 w-full flex-col items-center rounded-t-[40px] bg-surface-card px-6 pt-6 pb-9 shadow-[0px_-6px_20px_rgba(10,6,4,0.45)]">
              <div className="flex w-full max-w-[366px] flex-col gap-3">
                {promoCode ? (
                  <div className="flex h-[50px] w-full items-center justify-between rounded-[40px] border border-field bg-surface-card px-4 font-mono text-[14px] shadow-[0px_6px_20px_rgba(10,6,4,0.45)]">
                    <span className="font-bold text-highlight">{promoCode}</span>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-xs text-text-secondary underline hover:text-foreground cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                    <form
                      onSubmit={handlePromo}
                      className="relative flex h-[50px] w-full items-center rounded-full border border-field/60 bg-[#1e130f] pl-4 pr-1 shadow-inner"
                    >
                      <input
                        id="promo-code-input-mobile"
                        name="promoCodeMobile"
                        autoComplete="off"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Digite o código promocional..."
                        aria-label="Código promocional"
                        className="h-full min-w-0 flex-1 bg-transparent font-mono text-[13px] text-cream placeholder:text-sand/70 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="flex h-[42px] px-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#b87035] font-mono text-[15px] font-bold text-cream transition-opacity hover:opacity-90"
                      >
                        Aplicar
                      </button>
                    </form>
                )}

                <div className="flex h-5 items-center justify-between pt-1 font-mono">
                  <span className="text-[15px] leading-5 font-normal text-foreground">
                    Subtotal
                  </span>
                  <span className="text-[16px] leading-4 font-normal text-foreground">
                    {totals.subtotalEth} ETH
                  </span>
                </div>

                <div className="flex h-5 items-center justify-between font-mono">
                  <span className="text-[15px] leading-5 font-normal text-foreground">
                    Desconto do lançamento
                  </span>
                  <span className="text-[15px] leading-5 font-normal text-foreground">
                    {totals.discountEth === '0'
                      ? '(-) 00.00'
                      : `(-) ${totals.discountEth} ETH`}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-0 font-mono">
                  <div className="flex h-5 w-full items-center justify-between">
                    <span className="text-[15px] leading-5 font-normal text-foreground">
                      Taxa de rede
                    </span>
                    <span className="text-[16px] leading-4 font-normal text-foreground">
                      {totals.networkFeeEth} ETH
                    </span>
                  </div>
                  <span className="text-[12px] leading-4 font-normal text-highlight">
                    Taxa estimada
                  </span>
                </div>

                <div className="flex h-4 items-center justify-between font-mono">
                  <span className="text-[16px] leading-4 font-bold text-foreground">
                    Total
                  </span>
                  <span className="text-[18px] leading-4 font-bold text-highlight">
                    {totals.totalEth} ETH
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    to="/pagamento"
                    aria-label="Finalizar compra"
                    className={cn(
                      'flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[40px] bg-[#b87035] font-mono text-[16px] font-bold text-ink shadow-md transition-opacity hover:opacity-95',
                      items.length === 0 && 'pointer-events-none cursor-not-allowed opacity-50',
                    )}
                  >
                    Conectar e finalizar
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
