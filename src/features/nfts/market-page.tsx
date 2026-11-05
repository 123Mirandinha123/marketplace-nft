import { CatalogSection } from './catalog-section'
import { useCatalog } from './use-catalog'

export function MarketPage() {
  const catalog = useCatalog()

  return (
    <div className="kurio-shell py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-2 border-b border-line/70 pb-6">
        <p className="text-xs tracking-[0.16em] text-primary uppercase">
          Mercado Kurio
        </p>
        <h1 className="text-3xl font-bold text-cream">Explore a coleção</h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          NFTs selecionados de criadores independentes, verificados na Ethereum
          e na Polygon.
        </p>
      </div>
      <CatalogSection catalog={catalog} />
    </div>
  )
}
