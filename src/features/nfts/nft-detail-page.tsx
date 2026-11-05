import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  AtSign,
  Check,
  Copy,
  Globe,
  Heart,
  Minus,
  Plus,
  Search,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import nft1 from '@/assets/NFT-1.webp'
import nft2 from '@/assets/NFT-2.webp'
import nft3 from '@/assets/NFT-3.webp'
import nft4 from '@/assets/NFT-4.webp'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/features/cart/cart-context'
import { formatEth } from '@/lib/format'
import type { Nft } from '@/types/api'
import { NftArtwork } from './nft-artwork'
import { useNft, useNfts } from './use-nfts'

const fallbackGallery = [nft1, nft2, nft3, nft4]

const mockReviews = [
  {
    name: 'Ana P.',
    rating: 5,
    date: 'Há 2 dias',
    text: 'Cores impecáveis e entrega instantânea na carteira. A curadoria da Kurio acertou demais.',
  },
  {
    name: 'Rafael M.',
    rating: 5,
    date: 'Há 5 dias',
    text: 'A peça tem uma presença incrível na parede digital. Processo simples do começo ao fim.',
  },
  {
    name: 'Julia C.',
    rating: 4,
    date: 'Há 1 semana',
    text: 'Adorei a edição. Só gostaria de mais detalhes sobre a procedência no painel.',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Avaliação ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-[15px] ${
            index < Math.round(rating)
              ? 'fill-primary text-primary'
              : 'text-sand/40'
          }`}
        />
      ))}
    </span>
  )
}

function RelatedCard({ nft }: { nft: Nft }) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      className="group flex w-full flex-col gap-2 lg:w-[219px]"
    >
      <div className="flex h-[255px] w-full items-center justify-center rounded-[17px] bg-surface-card p-2 transition-transform group-hover:scale-[1.02]">
        <NftArtwork
          nft={nft}
          className="size-[212px] max-h-full max-w-full rounded-[15px]"
        />
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <p className="truncate text-[15px] leading-5 text-cream transition-colors group-hover:text-primary">
          {nft.title}
        </p>
        <p className="text-[16px] leading-4 font-bold text-highlight">
          {formatEth(nft.priceEth)}
        </p>
      </div>
    </Link>
  )
}

export function NftDetailPage({ nftId }: { nftId: string }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { data: nft, isLoading, isError, refetch } = useNft(nftId)
  const { data: related } = useNfts({ pageSize: 6 })
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(
    null,
  )
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState<'details' | 'reviews'>('details')
  const [favorite, setFavorite] = useState(false)

  const gallery = nft?.imageUrl
    ? [nft.imageUrl, ...fallbackGallery.filter((image) => image !== nft.imageUrl)].slice(
        0,
        4,
      )
    : fallbackGallery

  const relatedItems = useMemo(
    () => (related?.items ?? []).filter((item) => item.id !== nftId).slice(0, 5),
    [related?.items, nftId],
  )

  if (isLoading) {
    return (
      <div className="mx-auto grid w-full max-w-[1248px] gap-8 px-6 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    )
  }

  if (isError || !nft) {
    return (
      <div className="mx-auto w-full max-w-[1248px] px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-cream">NFT não encontrado</h1>
        <p className="mt-2 text-sm text-sand">
          O item pode ter sido removido ou o endereço está incorreto.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
          <Button asChild>
            <Link to="/mercado">Voltar ao mercado</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedEdition =
    nft.editions.find((edition) => edition.id === selectedEditionId) ??
    nft.editions.find((edition) => edition.available > 0) ??
    nft.editions[0]
  const maxQuantity = Math.max(1, selectedEdition.available)
  const soldOut = selectedEdition.available < 1
  const activeSource = gallery[activeImage] ?? gallery[0]

  function changeEdition(id: string) {
    setSelectedEditionId(id)
    setQuantity(1)
  }

  function addToCart() {
    if (soldOut) {
      toast.error('Esta edição está esgotada.')
      return
    }

    addItem({ nft: nft!, edition: selectedEdition, quantity })
    navigate({ to: '/carrinho' })
  }

  function toggleFavorite() {
    setFavorite((current) => !current)
    toast.success(
      favorite
        ? 'NFT removido dos favoritos.'
        : 'NFT adicionado aos favoritos.',
    )
  }

  function copyLink() {
    void navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiado.')
  }

  return (
    <>
      <div className="flex min-h-[100dvh] w-full flex-col justify-between bg-[#140d0a] md:hidden">
        {/* Top bar with back and heart floating buttons */}
        <div className="relative w-full px-5 pt-3 pb-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Voltar para a página anterior"
              onClick={() => navigate({ to: '/' })}
              className="flex size-11 items-center justify-center rounded-full bg-[#241612] text-sand shadow-lg active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Adicionar aos favoritos"
              onClick={toggleFavorite}
              className="flex size-11 items-center justify-center rounded-full bg-[#241612] text-sand shadow-lg active:scale-95"
            >
              <Heart
                className={`size-5 ${
                  favorite
                    ? 'fill-[#d28a4c] text-[#d28a4c]'
                    : 'text-sand'
                }`}
              />
            </button>
          </div>

          {/* Main artwork image */}
          <div className="mt-2 flex w-full items-center justify-center overflow-hidden rounded-[32px]">
            <img
              src={activeSource}
              alt={nft.title}
              className="aspect-square w-full max-w-[348px] rounded-[32px] object-cover shadow-2xl"
            />
          </div>
        </div>

        {/* Info card sliding up */}
        <div className="relative z-10 -mt-2 flex flex-1 flex-col gap-3 rounded-t-[36px] bg-[#241612] px-6 pt-6 pb-4 shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            <h1 className="truncate font-mono text-[22px] leading-6 font-bold text-cream">
              {nft.title}
            </h1>
            <div
              role="img"
              aria-label={`Avaliação ${nft.rating.toFixed(1)} de 5`}
              className="flex h-[28px] shrink-0 items-center gap-1.5 rounded-full border border-[#d28a4c] px-3 bg-transparent"
            >
              <Star className="size-3.5 fill-[#d28a4c] text-[#d28a4c]" />
              <span className="font-mono text-[13px] font-bold text-cream">
                {nft.rating.toFixed(1)}
              </span>
              <span className="font-mono text-[13px] text-text-secondary">
                ({nft.reviews})
              </span>
            </div>
          </div>

          <p className="font-mono text-[13px] leading-5 text-text-secondary">
            {nft.description}
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <span className="font-mono text-[15px] font-bold text-cream">
              Edição:
            </span>
            <div
              role="group"
              aria-label="Edições disponíveis"
              className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-0.5"
            >
              {nft.editions.map((edition) => {
                const active = edition.id === selectedEdition.id
                return (
                  <button
                    key={edition.id}
                    type="button"
                    disabled={edition.available < 1}
                    aria-pressed={active}
                    onClick={() => changeEdition(edition.id)}
                    className={`rounded-full px-3.5 py-1 font-mono text-[13px] transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-50 ${
                      active
                        ? 'border border-[#d28a4c] font-bold text-[#d28a4c] bg-transparent'
                        : 'border border-[#3e2b23] font-normal text-text-secondary hover:border-[#d28a4c]/50'
                    }`}
                  >
                    {edition.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 font-mono text-[13px] leading-5 text-sand">
            <p>ID do token: #{nft.tokenId}</p>
            <p>Coleção: {nft.collection}</p>
            <p>Atributos: {nft.attributes.join(', ')}</p>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="relative z-20 w-full border-t border-[#3e2b23]/40 bg-[#241612] px-6 pt-3 pb-8">
          <div className="mx-auto flex max-w-[366px] flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[14px] font-medium text-text-secondary">
                  Qtd.
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex size-7 items-center justify-center rounded-[8px] bg-[#cfb28c] text-ink font-bold disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    <Minus className="size-3.5 stroke-[3]" />
                  </button>
                  <span className="min-w-4 text-center font-mono text-[16px] font-bold text-cream">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    disabled={quantity >= maxQuantity}
                    onClick={() =>
                      setQuantity((current) => Math.min(maxQuantity, current + 1))
                    }
                    className="flex size-7 items-center justify-center rounded-[8px] bg-[#cfb28c] text-ink font-bold disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    <Plus className="size-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="font-mono text-[20px] font-bold text-[#d28a4c]">
                {formatEth(nft.priceEth)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={addToCart}
                disabled={soldOut}
                className="flex h-[52px] flex-1 items-center justify-center rounded-[40px] bg-[#b87035] font-mono text-[16px] font-bold text-ink shadow-md transition-opacity hover:opacity-90 active:scale-98 disabled:opacity-50"
              >
                Comprar NFT
              </button>
              <button
                type="button"
                aria-label="Adicionar ao carrinho"
                onClick={addToCart}
                disabled={soldOut}
                className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#201511] text-sand border border-[#3e2b23] shadow-md active:scale-95 disabled:opacity-50"
              >
                <ShoppingCart className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-[1248px] flex-col gap-[96px] px-6 py-6 md:flex">
        <section
          aria-label="Detalhes principais do produto"
          className="flex w-full flex-col gap-8"
        >
          <nav
            aria-label="Breadcrumb"
            className="flex h-4 items-center gap-2 text-[15px] leading-4 font-bold text-cream"
          >
            <Link to="/" className="transition-colors hover:text-primary">
              Início
            </Link>
            <span>/</span>
            <Link to="/mercado" className="transition-colors hover:text-primary">
              Mercado
            </Link>
          </nav>

          <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex w-full flex-col-reverse gap-4 sm:flex-row sm:items-center sm:gap-7 lg:w-[573px] lg:shrink-0">
              <div className="flex gap-4 sm:flex-col">
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Visualizar miniatura ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`size-[100px] shrink-0 overflow-hidden rounded-[8px] border bg-surface-card transition-all ${
                      index === activeImage
                        ? 'border-primary'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="size-full rounded-[8px] object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="relative flex w-full max-w-[444px] items-center justify-center rounded-[6px] bg-surface-card p-4 sm:size-[444px]">
                <img
                  src={activeSource}
                  alt={`Arte digital de ${nft.title}`}
                  className="size-[404px] max-h-full max-w-full rounded-[24px] object-cover"
                />
                <button
                  type="button"
                  aria-label="Ampliar imagem da arte"
                  title="Ampliar arte"
                  onClick={() => toast.info('Visualização ampliada em breve.')}
                  className="absolute top-[15px] right-[15px] flex size-[30px] items-center justify-center rounded-full border border-field bg-surface-raised text-cream transition-colors hover:border-primary hover:text-highlight"
                >
                  <Search className="size-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-5 lg:min-h-[448px]">
              <div className="flex flex-col gap-3">
                <h1 className="text-[28px] leading-[37px] font-bold text-cream">
                  {nft.title}
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[22px] leading-4 font-bold text-highlight">
                    {formatEth(nft.priceEth)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[15px] leading-5 text-cream">
                    <Stars rating={nft.rating} />
                    <span>{nft.reviews} avaliações de colecionadores</span>
                  </div>
                </div>
                <div className="w-full border-b border-primary/30 pt-1" />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[15px] leading-4 font-bold text-cream">
                  Sobre este NFT:
                </h2>
                <p className="text-[14px] leading-6 text-text-secondary">
                  {nft.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[15px] leading-4 font-bold text-cream">
                  Edição:
                </span>
                <div
                  role="group"
                  aria-label="Edições disponíveis"
                  className="flex flex-wrap items-center gap-[6px]"
                >
                  {nft.editions.map((edition) => {
                    const active = edition.id === selectedEdition.id
                    return (
                      <button
                        key={edition.id}
                        type="button"
                        disabled={edition.available < 1}
                        aria-pressed={active}
                        title={
                          edition.available < 1 ? 'Edição esgotada' : undefined
                        }
                        onClick={() => changeEdition(edition.id)}
                        className={`flex h-[28px] min-w-[36px] items-center justify-center rounded-full px-2 text-[14px] leading-4 transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-50 ${
                          active
                            ? 'border border-primary font-medium text-highlight'
                            : 'border border-field font-normal text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        {edition.name}
                      </button>
                    )
                  })}
                </div>
                <p aria-live="polite" className="text-[13px] leading-4 text-sand">
                  {soldOut
                    ? 'Edição esgotada.'
                    : `${selectedEdition.available} disponível(is) nesta edição. Máximo por compra: ${maxQuantity}.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex h-[49.5px] items-center gap-3">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-[49.5px] w-[33px] items-center justify-center rounded-[33px] border border-ink bg-primary text-black shadow-[0px_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:opacity-40"
                  >
                    <Minus className="size-4 stroke-[2.5]" />
                  </button>
                  <span className="min-w-[13px] text-center text-[20px] leading-7 text-cream">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    disabled={quantity >= maxQuantity}
                    onClick={() =>
                      setQuantity((current) => Math.min(maxQuantity, current + 1))
                    }
                    className="flex h-[49.5px] w-[33px] items-center justify-center rounded-[33px] border border-ink bg-primary text-black shadow-[0px_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:opacity-40"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={soldOut}
                    className="flex h-[40px] w-[130px] items-center justify-center rounded-[6px] bg-primary text-[14px] leading-5 font-bold text-ink transition-colors hover:bg-highlight disabled:opacity-50"
                  >
                    COMPRAR
                  </button>
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    className="flex h-[40px] w-[130px] items-center justify-center gap-2 rounded-[6px] border border-primary text-[14px] leading-5 font-medium text-highlight transition-colors hover:bg-primary/10"
                  >
                    {favorite ? (
                      <Check className="size-4" />
                    ) : (
                      <Heart className="size-4" />
                    )}
                    {favorite ? 'Favoritado' : 'Favoritar'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-col gap-3 text-[15px] leading-5 text-sand">
                  <p>ID do token: #{nft.tokenId}</p>
                  <p>Coleção: {nft.collection}</p>
                  <p>Atributos: {nft.attributes.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[15px] text-cream">
                  <Share2 className="size-4 text-sand" />
                  <span className="font-bold">Compartilhar este NFT:</span>
                  <button
                    type="button"
                    aria-label="Compartilhar no X"
                    onClick={() => toast.info('Compartilhamento simulado.')}
                    className="flex size-7 items-center justify-center rounded-full border border-field text-sand transition-colors hover:border-primary hover:text-highlight"
                  >
                    <AtSign className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Compartilhar em uma rede social"
                    onClick={() => toast.info('Compartilhamento simulado.')}
                    className="flex size-7 items-center justify-center rounded-full border border-field text-sand transition-colors hover:border-primary hover:text-highlight"
                  >
                    <Globe className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Copiar link"
                    onClick={copyLink}
                    className="flex size-7 items-center justify-center rounded-full border border-field text-sand transition-colors hover:border-primary hover:text-highlight"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-8 border-b border-primary/30">
            <button
              type="button"
              onClick={() => setTab('details')}
              className={`-mb-px border-b-[3px] pb-3 text-[17px] leading-4 transition-colors ${
                tab === 'details'
                  ? 'border-primary font-bold text-highlight'
                  : 'border-transparent text-cream hover:text-highlight'
              }`}
            >
              Detalhes do NFT
            </button>
            <button
              type="button"
              onClick={() => setTab('reviews')}
              className={`-mb-px border-b-[3px] pb-3 text-[17px] leading-4 transition-colors ${
                tab === 'reviews'
                  ? 'border-primary font-bold text-highlight'
                  : 'border-transparent text-cream hover:text-highlight'
              }`}
            >
              Avaliações de colecionadores ({nft.reviews})
            </button>
          </div>

          {tab === 'details' ? (
            <div className="flex flex-col gap-6 pt-2 text-[14px] leading-6 text-text-secondary">
              <p>
                {nft.title} é uma obra digital da coleção {nft.collection}. Cada
                atributo fica armazenado nos metadados do token e verificado na{' '}
                {nft.network}.
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-bold text-cream">Rede:</p>
                  <p>
                    Cunhado na {nft.network} com procedência imutável e
                    metadados armazenados no IPFS.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-cream">Contrato:</p>
                  <p>
                    {nft.contractAddress} • Contrato inteligente ERC-721
                    (simulado).
                  </p>
                </div>
                <div>
                  <p className="font-bold text-cream">Criador:</p>
                  <p>
                    {nft.creator.name} · {nft.creator.address}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pt-2">
              {mockReviews.map((review) => (
                <article
                  key={review.name}
                  className="flex flex-col gap-2 rounded-[8px] bg-surface-card p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                        {review.name.slice(0, 1)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-cream">
                          {review.name}
                        </span>
                        <span className="text-[12px] text-sand">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <Stars rating={review.rating} />
                  </div>
                  <p className="text-[14px] leading-6 text-text-secondary">
                    {review.text}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="related-heading"
          className="flex w-full flex-col gap-8"
        >
          <div className="flex flex-col gap-3">
            <h2
              id="related-heading"
              className="font-mono text-[17px] leading-4 font-bold text-highlight"
            >
              Mais desta coleção
            </h2>
            <div className="w-full border-b border-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-[28px]">
            {relatedItems.map((item) => (
              <RelatedCard key={item.id} nft={item} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
