import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'

import nft1 from '@/assets/NFT-1.webp'
import nft2 from '@/assets/NFT-2.webp'
import nft3 from '@/assets/NFT-3.webp'
import nft4 from '@/assets/NFT-4.webp'
import { CatalogSection } from '@/features/nfts/catalog-section'
import { useCatalog } from '@/features/nfts/use-catalog'

const heroSlides = [
  {
    tag: 'Bem-vindo à Kurio',
    title: 'SEJA DONO DO FUTURO\nDA ARTE DIGITAL',
    mobileTitle: 'SEJA DONO DA\nCULTURA DIGITAL',
    description:
      'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
    mobileDescription: 'Descubra NFTs selecionados de criadores do mundo todo.',
    image: nft1,
    secondaryImage: nft4,
    imageAlt: 'Obra digital em destaque: Emerald Ape #042 por Nova Sato',
  },
  {
    tag: 'Criadores em destaque',
    title: 'EXPANDA SEUS HORIZONTES\nNA ARTE GENERATIVA',
    mobileTitle: 'O NOVO CAPÍTULO\nDOS COLECIONÁVEIS',
    description:
      'Explore criações audaciosas de mentes visionárias que fundem estética contemporânea, algoritmos e autenticidade on-chain para redefinir o valor da posse digital.',
    mobileDescription: 'Arte digital com alma, raridade comprovada e conexão direta com criadores.',
    image: nft4,
    secondaryImage: nft2,
    imageAlt: 'Obra digital em destaque: Sage Nomad por Aisha Thorne',
  },
  {
    tag: 'Lançamentos selecionados',
    title: 'ACERVO EXCLUSIVO:\nRARIDADE EM CADA PIXEL',
    mobileTitle: 'DROP EXCLUSIVO:\nPEÇAS ICÔNICAS',
    description:
      'Edições numeradas e cunhadas diretamente na Ethereum. Uma curadoria criteriosa de peças raras prontas para fazer história na sua carteira digital.',
    mobileDescription: 'Edições ultralimitadas com proveniência imutável e prestígio na comunidade.',
    image: nft3,
    secondaryImage: nft1,
    imageAlt: 'Obra digital em destaque: Solace in Motion por Kaelen Voss',
  },
]

const journalPosts = [
  {
    date: '12 de setembro',
    read: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: nft2,
  },
  {
    date: '13 de setembro',
    read: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
    image: nft1,
  },
  {
    date: '15 de setembro',
    read: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: nft4,
  },
  {
    date: '15 de setembro',
    read: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: nft3,
  },
]

export function HomePage() {
  const catalog = useCatalog()
  const location = useLocation()
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (location.hash === 'catalogo') {
      const el = document.getElementById('catalogo')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location.hash])

  function openFilters() {
    catalog.setFiltersOpen(true)
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  }

  const slide = heroSlides[activeSlide] ?? heroSlides[0]

  return (
    <div className="kurio-shell flex w-full flex-col gap-4 pt-10 pb-8 md:gap-[96px] md:pt-0 md:pb-0">
      <div className="mx-auto flex w-full max-w-[366px] items-center gap-2 lg:hidden">
        <div className="flex h-[45px] flex-1 items-center gap-2 rounded-[10px] bg-surface-card px-3.5">
          <Search className="size-[18px] shrink-0 text-sand" />
          <input
            type="search"
            value={catalog.q}
            onChange={(event) => catalog.setQ(event.target.value)}
            placeholder="Explorar coleções"
            aria-label="Explorar coleções"
            className="w-full bg-transparent text-[14px] leading-4 font-bold text-cream placeholder:text-sand focus:outline-none"
          />
        </div>
        <button
          type="button"
          aria-label="Abrir filtros"
          onClick={openFilters}
          className="flex size-[45px] shrink-0 items-center justify-center rounded-[14px] shadow-sm"
          style={{
            background:
              'linear-gradient(137.05deg, rgba(210, 138, 76, 0.45) -24.6%, var(--color-primary) 100%)',
          }}
        >
          <SlidersHorizontal className="size-5 text-ink" />
        </button>
      </div>

      <section
        aria-labelledby="mobile-hero-title"
        className="relative mx-auto flex h-[190px] w-full max-w-[366px] flex-col justify-between overflow-hidden rounded-[30px] border border-primary/20 p-4 shadow-[0px_4px_24px_rgba(10,6,4,0.6)] md:hidden transition-all duration-300"
        style={{
          background:
            'linear-gradient(104.74deg, rgba(210, 138, 76, 0.22) 1.08%, rgba(210, 138, 76, 0.08) 99.23%), var(--color-surface-deep)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-8 -left-16 size-48 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(221, 154, 95, 0.45) 0%, rgba(210, 138, 76, 0.05) 70%, transparent 100%)',
          }}
        />
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex w-[190px] shrink-0 flex-col gap-1">
            <span className="text-[12px] leading-4 font-medium text-cream">
              {slide.tag}
            </span>
            <h1
              id="mobile-hero-title"
              className="text-[18px] leading-[22px] font-bold tracking-tight text-cream whitespace-pre-line"
            >
              {slide.mobileTitle}
            </h1>
            <p className="mt-0.5 text-[12px] leading-[15px] text-text-secondary line-clamp-2">
              {slide.mobileDescription}
            </p>
            <a
              href="#catalogo"
              className="mt-1 flex items-center gap-1 text-[12px] leading-[14px] font-bold text-highlight"
            >
              EXPLORAR
              <ArrowRight className="size-3.5" />
            </a>
          </div>
          <div className="relative flex size-[138px] shrink-0 items-center justify-end">
            <img
              src={slide.image}
              alt={slide.imageAlt}
              className="size-[134px] rounded-[16px] border border-primary/30 object-cover shadow-md transition-opacity duration-300"
            />
            {slide.secondaryImage ? (
              <img
                src={slide.secondaryImage}
                alt=""
                className="absolute -bottom-1 -left-2 size-[58px] rounded-[16px] border-2 border-ink object-cover shadow-xl"
              />
            ) : null}
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Controle de slides mobile"
          className="relative z-10 flex items-center justify-center gap-0 pt-2"
        >
          {heroSlides.map((item, index) => {
            const isSelected = index === activeSlide
            return (
              <button
                key={item.tag}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Slide ${index + 1} de ${heroSlides.length}: ${item.tag}`}
                onClick={() => setActiveSlide(index)}
                className="flex size-6 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  aria-hidden="true"
                  className={`size-[7px] rounded-full transition-colors duration-200 ${
                    isSelected
                      ? 'bg-primary'
                      : 'bg-primary/40 hover:bg-primary/80'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </section>

      <section
        aria-labelledby="hero-title"
        className="mt-8 hidden h-[450px] w-full items-center justify-between gap-10 pl-0 md:flex lg:pl-10 xl:gap-[110px]"
      >
        <div className="flex w-full max-w-[600px] flex-col gap-[44px] xl:w-[600px]">
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] leading-4 font-medium tracking-[0.1em] text-cream">
                  {slide.tag}
                </p>
                <h1
                  id="hero-title"
                  className="text-[43px] leading-[70px] font-bold whitespace-pre-line text-cream"
                >
                  {slide.title}
                </h1>
              </div>
              <p className="max-w-[557px] text-[14px] leading-6 text-text-secondary">
                {slide.description}
              </p>
            </div>
            <a
              href="#catalogo"
              className="flex h-10 w-[140px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-[16px] leading-5 font-bold text-ink transition-colors hover:bg-highlight"
            >
              EXPLORAR
            </a>
          </div>
          <div
            role="tablist"
            aria-label="Controle de slides do hero"
            className="flex gap-0 self-end"
          >
            {heroSlides.map((item, index) => {
              const isSelected = index === activeSlide
              return (
                <button
                  key={item.tag}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`Slide ${index + 1} de ${heroSlides.length}: ${item.tag}`}
                  onClick={() => setActiveSlide(index)}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary'
                        : 'bg-primary/60 hover:bg-primary/90'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
        <img
          src={slide.image}
          width={450}
          height={450}
          alt={slide.imageAlt}
          className="hidden size-[280px] shrink-0 rounded-[24px] object-cover md:block lg:size-[400px] xl:size-[450px] transition-all duration-300"
        />
      </section>

      <CatalogSection catalog={catalog} />

      <section
        aria-label="Destaques promocionais"
        className="mx-auto hidden w-full max-w-[1200px] flex-col gap-7 md:flex lg:h-[250px] lg:flex-row lg:justify-between lg:gap-[28px]"
      >
        {[
          {
            image: nft1,
            imageWidth: '292px',
            title: 'Lançamentos gênesis\nde edição limitada',
            description:
              'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
          },
          {
            image: nft2,
            imageWidth: '287px',
            title: 'Arte digital curada\ne muito mais',
            description:
              'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
          },
        ].map((card) => (
          <article
            key={card.title}
            className="relative flex h-[250px] w-full overflow-hidden rounded-[8px] bg-card lg:min-w-0 lg:flex-1 xl:w-[586px] xl:flex-none"
          >
            <div className="pointer-events-none absolute -left-[191px] top-[142px] size-[256px] rounded-full border-2 border-primary" />
            <div className="pointer-events-none absolute -left-[199px] top-[134px] size-[256px] rounded-full border border-primary" />
            <img
              src={card.image}
              alt=""
              className="relative z-10 hidden h-[250px] rounded-[18px] object-cover sm:block"
              style={{ width: card.imageWidth }}
            />
            <div className="relative z-10 flex flex-1 flex-col items-end justify-between p-6 text-right sm:py-8 sm:pr-[30px] sm:pl-3">
              <h3 className="whitespace-pre-line text-[18px] leading-6 font-bold text-cream">
                {card.title}
              </h3>
              <p className="max-w-[263px] text-[14px] leading-[22px] text-text-secondary">
                {card.description}
              </p>
              <Link
                to="/mercado"
                className="flex h-10 w-[140px] shrink-0 items-center justify-center gap-2 rounded-[6px] bg-primary text-[14px] leading-5 font-medium text-ink transition-colors hover:bg-highlight"
              >
                Explorar
                <ArrowRight className="size-[18px]" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section
        aria-labelledby="blog-title"
        className="mx-auto hidden w-full max-w-[1200px] flex-col items-center gap-10 md:flex"
      >
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <h2
            id="blog-title"
            className="text-[28px] leading-[37px] font-bold text-cream"
          >
            Diário da Cunhagem
          </h2>
          <p className="text-[14px] leading-[18px] text-text-secondary">
            Histórias, guias e insights para colecionadores sobre o universo da
            propriedade digital.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journalPosts.map((post) => (
            <article
              key={post.title}
              className="group flex h-[380px] w-full flex-col overflow-hidden rounded-[8px] bg-card transition-colors hover:bg-surface-raised"
            >
              <div className="h-[195px] w-full shrink-0 overflow-hidden">
                <img
                  src={post.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] leading-4 font-medium text-text-secondary">
                    {post.date} &nbsp;|&nbsp; {post.read}
                  </p>
                  <h3 className="line-clamp-2 text-[16px] leading-[21px] font-bold text-cream">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-[12px] leading-4 text-text-secondary">
                    {post.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 pt-2 text-left text-[12px] leading-[14px] font-bold text-highlight"
                  onClick={() =>
                    toast.info('O Diário da Cunhagem será publicado em breve.')
                  }
                >
                  Ler mais
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
