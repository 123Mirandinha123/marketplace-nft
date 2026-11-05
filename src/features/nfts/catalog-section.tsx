import {
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import nft4 from '@/assets/NFT-4.webp'
import { NftGrid, NftGridSkeleton } from './nft-grid'
import type { CatalogController, CatalogSort } from './use-catalog'

const tabs = [
  { id: 'all' as const, label: 'Todos os NFTs' },
  { id: 'new' as const, label: 'Novos lançamentos' },
  { id: 'trending' as const, label: 'Em alta' },
]

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: 'recent', label: 'Listados recentemente' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'rating', label: 'Melhor avaliados' },
]

function SortDropdown({
  value,
  onChange,
}: {
  value: CatalogSort
  onChange: (sort: CatalogSort) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption =
    sortOptions.find((opt) => opt.value === value) ?? sortOptions[0]

  return (
    <div
      ref={ref}
      className="relative inline-flex items-center gap-1.5 font-mono text-[15px] leading-5 text-foreground"
    >
      <span className="cursor-pointer font-normal whitespace-nowrap text-foreground">
        Ordenar por:
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`group relative flex cursor-pointer items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 font-normal transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          open ? 'text-highlight' : 'text-foreground'
        }`}
      >
        <span className="whitespace-nowrap">{currentOption.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Opções de ordenação"
          className="absolute top-full right-0 z-50 mt-2 min-w-[210px] overflow-hidden rounded-[8px] border border-surface-dark bg-card p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.85)] animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {sortOptions.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-[5px] px-3 py-2 text-left font-mono text-[14px] leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isSelected
                    ? 'bg-surface-dark font-bold text-highlight'
                    : 'font-normal text-foreground hover:bg-surface-raised hover:text-highlight'
                }`}
              >
                <span>{option.label}</span>
                {isSelected ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function FilterPanel({
  catalog,
  compact = false,
  onClose,
}: {
  catalog: CatalogController
  compact?: boolean
  onClose?: () => void
}) {
  const min = Number(catalog.facets.data?.priceMinEth ?? 0)
  const max = Number(catalog.facets.data?.priceMaxEth ?? 12.3)
  const [draft, setDraft] = useState<[number, number] | null>(null)
  const price = draft ?? [min, max]
  const minPercent = max > min ? ((price[0] - min) / (max - min)) * 100 : 0
  const maxPercent = max > min ? ((price[1] - min) / (max - min)) * 100 : 100

  return (
    <div
      className={
        compact
          ? 'flex w-full flex-col gap-6 p-6'
          : 'flex w-full flex-col gap-6'
      }
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={catalog.q}
            onChange={(event) => catalog.setQ(event.target.value)}
            placeholder="Buscar NFTs"
            className="h-10 w-full rounded-[5px] border border-field bg-surface-card pr-3 pl-9 text-sm text-cream placeholder:text-text-secondary/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        <button
          type="button"
          className="self-start text-[12px] text-highlight hover:underline"
          onClick={catalog.clearFilters}
        >
          Limpar filtros
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[18px] leading-4 font-bold text-cream">Coleções</h2>
        <div className="flex flex-col px-3">
          {catalog.facets.data?.collections.map((item) => {
            const active = catalog.collection === item.name

            return (
              <label
                key={item.name}
                className={`flex h-10 cursor-pointer items-center justify-between text-[15px] leading-10 transition-colors hover:text-highlight ${
                  active ? 'text-highlight' : 'text-text-secondary'
                }`}
              >
                <input
                  type="radio"
                  name={compact ? 'mobile-collection' : 'desktop-collection'}
                  value={item.name}
                  checked={active}
                  onChange={() => catalog.setCollection(item.name)}
                  className="sr-only"
                />
                <span>{item.name}</span>
                <span className="font-bold">({item.count})</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[18px] leading-4 font-bold text-cream">
          Faixa de preço
        </h2>
        <div className="flex flex-col gap-3 pl-3">
          <div className="relative flex h-6 w-full items-center">
            <div className="h-1 w-full rounded-full bg-text-secondary/30" />
            <div
              className="pointer-events-none absolute h-1 rounded-full bg-primary"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`,
              }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step="0.01"
              value={price[0]}
              aria-label="Preço mínimo em ETH"
              onChange={(event) => {
                const next = Number(event.target.value)
                setDraft([Math.min(next, price[1]), price[1]])
              }}
              className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary"
            />
            <input
              type="range"
              min={min}
              max={max}
              step="0.01"
              value={price[1]}
              aria-label="Preço máximo em ETH"
              onChange={(event) => {
                const next = Number(event.target.value)
                setDraft([price[0], Math.max(next, price[0])])
              }}
              className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
          <span className="text-[15px] leading-5 text-cream">
            Preço: {price[0].toFixed(2).replace('.', ',')} -{' '}
            {price[1].toFixed(2).replace('.', ',')} ETH
          </span>
          <button
            type="button"
            className="flex h-9 w-[92px] items-center justify-center rounded-[6px] bg-primary text-[16px] leading-5 font-bold text-ink transition-colors hover:bg-highlight"
            onClick={() => {
              catalog.applyPrice(price)
              if (compact && onClose) onClose()
            }}
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[18px] leading-4 font-bold text-cream">Rede</h2>
        <div className="flex flex-col pl-3">
          {catalog.facets.data?.networks.map((item) => {
            const active = catalog.network === item.name

            return (
              <label
                key={item.name}
                className={`flex h-10 w-full cursor-pointer items-center justify-between text-[15px] leading-10 transition-colors hover:text-highlight ${
                  active ? 'text-highlight' : 'text-text-secondary'
                }`}
              >
                <input
                  type="radio"
                  name={compact ? 'mobile-network' : 'desktop-network'}
                  value={item.name}
                  checked={active}
                  onChange={() => {
                    catalog.setNetwork(item.name)
                    if (compact && onClose) onClose()
                  }}
                  className="sr-only"
                />
                <span>{item.name}</span>
                <span>({item.count})</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Pagination({ catalog }: { catalog: CatalogController }) {
  const maxPages = Math.min(4, Math.max(1, catalog.totalPages))
  const pages = Array.from({ length: maxPages }, (_, index) => index + 1)

  function handlePageChange(newPage: number) {
    catalog.setPage(newPage)
    const el = document.getElementById('catalogo')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="flex flex-row items-center gap-2"
      aria-label="Paginação do catálogo"
    >
      <ol className="flex flex-row items-center gap-2">
        {pages.map((page) => {
          const isCurrent = page === catalog.page
          return (
            <li key={page}>
              <button
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Página ${page}`}
                onClick={() => handlePageChange(page)}
                className={`inline-flex size-[35px] cursor-pointer items-center justify-center rounded-[4px] font-mono text-[18px] leading-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isCurrent
                    ? 'bg-primary font-bold text-ink hover:bg-highlight'
                    : 'border border-field font-normal text-foreground hover:border-primary hover:text-highlight hover:bg-field/30'
                }`}
              >
                {page}
              </button>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        aria-label="Próxima página"
        title="Próxima"
        disabled={catalog.page >= maxPages}
        onClick={() => handlePageChange(Math.min(maxPages, catalog.page + 1))}
        className="inline-flex size-[35px] cursor-pointer items-center justify-center rounded-[4px] font-mono text-[18px] leading-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary border border-field text-foreground hover:border-primary hover:text-highlight hover:bg-field/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-field disabled:hover:text-foreground disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

export function CatalogSection({ catalog }: { catalog: CatalogController }) {
  const { nfts } = catalog

  return (
    <section id="catalogo" className="relative">
      <h2 className="sr-only">Catálogo</h2>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="hidden w-[310px] shrink-0 flex-col gap-6 lg:flex">
          <div className="flex min-h-[785px] w-[310px] flex-col bg-surface-card p-5">
            <FilterPanel catalog={catalog} />
          </div>
          <div
            className="relative flex h-[470px] w-[310px] flex-col items-center pt-6 pb-1"
            style={{
              background:
                'linear-gradient(rgba(210, 138, 76, 0.1) 0%, rgba(210, 138, 76, 0.03) 100%)',
            }}
          >
            <div className="flex h-[448px] w-full flex-col gap-4 px-0">
              <div className="flex h-[64px] w-full flex-col items-center gap-4">
                <h3 className="h-8 w-full text-center font-mono text-[24px] leading-8 font-bold text-highlight">
                  NFT EM DESTAQUE
                </h3>
                <p className="h-4 w-full text-center font-mono text-[22px] leading-4 font-bold text-foreground">
                  OFERTA LIMITADA
                </p>
              </div>
              <div className="relative mx-auto h-[368px] w-full overflow-hidden rounded-[22px]">
                <img
                  src={nft4}
                  alt="NFT em destaque: Oferta Limitada"
                  width={310}
                  height={368}
                  className="h-[368px] w-full rounded-[22px] object-cover"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[299px] left-[16px] size-[22px] rounded-[7px] border border-primary/40 opacity-20"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[343px] left-[248px] size-[45px] rounded-[29px]"
                  style={{
                    background:
                      'linear-gradient(145.46deg, rgba(210, 138, 76, 0.4) 0%, rgba(210, 138, 76, 0.05) 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex w-full min-w-0 flex-1 flex-col items-end gap-6 sm:gap-8 lg:gap-8 xl:w-[842px] xl:shrink-0">
          <div className="flex w-full flex-col items-start gap-4 md:gap-5">
            <div className="hidden w-full flex-wrap items-center justify-between gap-x-4 gap-y-5 md:flex">
              <nav
                aria-label="Abas do catálogo"
                className="relative flex items-center gap-5 font-mono text-[15px] font-medium leading-4 whitespace-nowrap"
              >
                {tabs.map((tab) => {
                  const active = catalog.tab === tab.id

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => catalog.setTab(tab.id)}
                      className={`relative cursor-pointer py-1 transition-colors duration-150 ${
                        active
                          ? 'font-bold text-highlight'
                          : 'text-foreground hover:text-highlight'
                      }`}
                    >
                      {tab.label}
                      {active ? (
                        <span className="absolute -bottom-[10px] left-0 h-[2px] w-full bg-primary" />
                      ) : null}
                    </button>
                  )
                })}
              </nav>

              <div className="ml-auto flex items-center gap-4">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  className="inline-flex h-[35px] cursor-pointer items-center gap-2 rounded-[6px] border border-primary px-3 font-mono text-[15px] leading-4 font-medium text-highlight transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
                  onClick={() => catalog.setFiltersOpen(!catalog.filtersOpen)}
                >
                  <SlidersHorizontal className="size-4" />
                  Filtros
                </button>

                <SortDropdown
                  value={catalog.sort}
                  onChange={(nextSort) => catalog.setSort(nextSort)}
                />
              </div>
            </div>

            <div className="flex w-full items-center justify-between pb-1 md:hidden">
              <nav
                aria-label="Abas do catálogo móvel"
                className="flex w-full items-center justify-between font-mono text-[14px] font-medium leading-4"
              >
                {tabs.map((tab) => {
                  const active = catalog.tab === tab.id

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => catalog.setTab(tab.id)}
                      className={`relative cursor-pointer py-1.5 transition-colors duration-150 ${
                        active
                          ? 'font-bold text-[#d28a4c]'
                          : 'text-cream/90 hover:text-cream'
                      }`}
                    >
                      {tab.label}
                      {active ? (
                        <span className="absolute -bottom-[2px] left-0 h-[2px] w-full bg-[#d28a4c]" />
                      ) : null}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Modal de filtros em tela cheia no mobile */}
            {catalog.filtersOpen ? (
              <div className="fixed inset-0 z-50 flex flex-col bg-[#140d0a] md:hidden">
                <div className="flex h-16 items-center justify-between border-b border-field/40 px-6">
                  <h2 className="font-mono text-[18px] font-bold text-cream">Filtros</h2>
                  <button
                    type="button"
                    onClick={() => catalog.setFiltersOpen(false)}
                    aria-label="Fechar filtros"
                    className="flex size-10 items-center justify-center rounded-full bg-[#201511] text-sand transition-transform active:scale-95"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FilterPanel
                    catalog={catalog}
                    compact
                    onClose={() => catalog.setFiltersOpen(false)}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {nfts.isLoading ? (
            <NftGridSkeleton />
          ) : nfts.isError ? (
            <div className="w-full rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center">
              <p className="text-sm text-cream">
                Não foi possível carregar os NFTs agora.
              </p>
              <button
                type="button"
                className="mt-4 h-10 rounded-[6px] border border-primary px-4 text-sm font-bold text-highlight"
                onClick={() => void nfts.refetch()}
              >
                Tentar novamente
              </button>
            </div>
          ) : nfts.data?.items.length ? (
            <NftGrid nfts={nfts.data.items} />
          ) : (
            <div className="w-full rounded-xl border border-line bg-surface-card p-10 text-center">
              <p className="text-sm text-cream">
                Nenhum NFT encontrado com esses filtros.
              </p>
              <button
                type="button"
                className="mt-3 text-sm text-highlight hover:underline"
                onClick={catalog.clearFilters}
              >
                Limpar filtros
              </button>
            </div>
          )}

          <Pagination catalog={catalog} />
        </div>
      </div>

      {nfts.isFetching && !nfts.isLoading ? (
        <div className="mt-6 flex items-center justify-end text-xs text-text-secondary">
          <span>Atualizando…</span>
        </div>
      ) : null}
    </section>
  )
}
