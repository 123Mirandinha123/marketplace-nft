import { Link } from '@tanstack/react-router'
import { Fragment, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

const highlightCards = [
  {
    initial: 'W',
    title: 'Segurança da carteira',
    description:
      'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    initial: 'C',
    title: 'Criadores em destaque',
    description:
      'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    initial: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

type FooterLink = {
  label: string
  to?: '/' | '/perfil' | '/carteiras'
}

const profileLinks: FooterLink[] = [
  { label: 'Meu perfil', to: '/perfil' },
  { label: 'Minha coleção', to: '/' },
  { label: 'Atividade' },
  { label: 'Estúdio do criador' },
  { label: 'Lista de interesse' },
]

const helpLinks: FooterLink[] = [
  { label: 'Central de ajuda' },
  { label: 'Como comprar NFTs' },
  { label: 'Carteira e segurança', to: '/carteiras' },
  { label: 'Política do mercado' },
  { label: 'Denunciar item' },
]

const collectionLinks = [
  'Arte digital',
  'Fotografia',
  'Música',
  'Arte 3D',
  'Utilidade',
]

export function Footer() {
  const [email, setEmail] = useState('')

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Informe um e-mail válido.')
      return
    }

    toast.success('Inscrição registrada. Até o próximo lançamento.')
    setEmail('')
  }

  return (
    <footer className="mt-24 w-full bg-background pb-6 text-cream">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col">
        <div className="flex w-full flex-col bg-card p-6 sm:p-8 lg:p-[32px] xl:h-[250px]">
          <div className="mx-auto grid w-full grid-cols-1 justify-between gap-6 md:grid-cols-2 lg:flex lg:flex-row lg:items-start lg:gap-0">
            {highlightCards.map((card) => (
              <Fragment key={card.initial}>
                <div className="flex flex-col gap-[10px] lg:min-w-0 lg:flex-1 lg:px-[16px]">
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex size-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-[24px] leading-8 font-bold text-ink">
                      {card.initial}
                    </div>
                    <h3 className="min-h-4 text-[17px] leading-4 font-bold text-cream">
                      {card.title}
                    </h3>
                    <p className="w-full max-w-[204px] text-[14px] leading-[22px] text-text-secondary">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="hidden w-px shrink-0 self-stretch bg-primary lg:block"
                />
              </Fragment>
            ))}

            <div className="flex flex-col gap-[12px] lg:w-[357px] lg:shrink-0 lg:px-[16px]">
              <div className="flex flex-col gap-[12px]">
                <h3 className="whitespace-pre-line text-[18px] leading-4 font-bold text-cream">
                  {'Antecipe-se ao próximo\nlançamento'}
                </h3>
                <form
                  onSubmit={handleNewsletter}
                  className="flex h-[40px] w-full max-w-[325px] items-center justify-between rounded-[6px] bg-surface-dark pl-[12px] shadow-[0px_0px_20px_rgba(10,6,4,0.45)]"
                >
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="digite seu email"
                    aria-label="Assinar newsletter"
                    className="min-w-0 flex-1 bg-transparent text-[14px] leading-4 text-cream placeholder:text-sand focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-[40px] w-[85px] shrink-0 items-center justify-center rounded-r-[6px] bg-primary text-[18px] leading-4 font-bold text-ink transition-colors hover:bg-highlight"
                  >
                    Enviar
                  </button>
                </form>
              </div>
              <p className="w-full max-w-[325px] text-[13px] leading-[22px] text-text-secondary">
                Receba lançamentos selecionados, histórias de criadores e
                novidades do mercado.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col">
          <div className="flex w-full flex-col justify-center bg-surface-dark p-6 sm:p-8 lg:h-[88px] lg:p-[32px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:gap-8 xl:gap-[92px]">
              <div className="flex items-center lg:flex-1">
                <a
                  href="http://localhost:5173/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 text-[14px] leading-[18px] font-bold tracking-[0.1em] text-cream transition-colors hover:text-primary"
                >
                  KURIO
                </a>
              </div>
              <div className="flex items-center lg:flex-1">
                <p className="text-[14px] leading-[22px] text-cream">
                  Feito para colecionadores, criadores e cultura
                </p>
              </div>
              <div className="flex items-center lg:flex-1">
                <a
                  href="mailto:contato@email.com"
                  className="text-[14px] leading-[22px] text-cream transition-colors hover:text-primary"
                >
                  contato@email.com
                </a>
              </div>
              <div className="flex items-center lg:flex-none">
                <a
                  href="tel:+551140028922"
                  className="text-[14px] leading-[22px] text-cream transition-colors hover:text-primary"
                >
                  +55 11 4002 8922
                </a>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-[6px]">
            <div className="flex w-full flex-col items-start bg-card p-6 sm:p-8 lg:p-[32px]">
              <div className="flex w-full flex-col justify-between gap-8 sm:flex-row sm:flex-wrap lg:flex-nowrap lg:gap-12 xl:gap-[124px]">
                <div className="flex flex-col gap-2 lg:flex-1">
                  <h4 className="h-4 text-[18px] leading-4 font-bold text-cream">
                    Meu perfil
                  </h4>
                  <ul className="flex flex-col">
                    {profileLinks.map((item) => (
                      <li key={item.label} className="h-[30px]">
                        {item.to ? (
                          <Link
                            to={item.to}
                            className="inline-block text-[14px] leading-[30px] text-cream transition-colors hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="text-[14px] leading-[30px] text-cream/60">
                            {item.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:flex-1">
                  <h4 className="h-4 text-[18px] leading-4 font-bold text-cream">
                    Central de ajuda
                  </h4>
                  <ul className="flex flex-col">
                    {helpLinks.map((item) => (
                      <li key={item.label} className="h-[30px]">
                        {item.to ? (
                          <Link
                            to={item.to}
                            className="inline-block text-[14px] leading-[30px] text-cream transition-colors hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="text-[14px] leading-[30px] text-cream/60">
                            {item.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:flex-1">
                  <h4 className="h-4 text-[18px] leading-4 font-bold text-cream">
                    Coleções
                  </h4>
                  <ul className="flex flex-col">
                    {collectionLinks.map((collection) => (
                      <li key={collection} className="h-[30px]">
                        <Link
                          to="/mercado"
                          className="inline-block text-[14px] leading-[30px] text-cream transition-colors hover:text-primary"
                        >
                          {collection}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-[32px] lg:h-[152px] lg:w-[228px] lg:flex-none">
                  <div className="flex flex-col gap-[20px] lg:h-[66px] lg:w-[190px]">
                    <h4 className="h-[16px] font-mono text-[18px] leading-[16px] font-bold text-foreground">
                      Redes sociais
                    </h4>
                    <div className="flex h-[30px] w-[190px] items-center gap-[10px]">
                      <a
                        href="#"
                        aria-label="Facebook"
                        onClick={(e) => {
                          e.preventDefault()
                          toast.info('Facebook em breve.')
                        }}
                        className="group flex size-[30px] cursor-pointer items-center justify-center rounded-[4px] border border-primary transition-colors duration-150 hover:bg-primary"
                      >
                        <svg
                          className="size-4 fill-primary transition-colors duration-150 group-hover:fill-ink"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-label="Instagram"
                        onClick={(e) => {
                          e.preventDefault()
                          toast.info('Instagram em breve.')
                        }}
                        className="group flex size-[30px] cursor-pointer items-center justify-center rounded-[4px] border border-primary transition-colors duration-150 hover:bg-primary"
                      >
                        <svg
                          className="size-4 fill-primary transition-colors duration-150 group-hover:fill-ink"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-label="Twitter"
                        onClick={(e) => {
                          e.preventDefault()
                          toast.info('X / Twitter em breve.')
                        }}
                        className="group flex size-[30px] cursor-pointer items-center justify-center rounded-[4px] border border-primary transition-colors duration-150 hover:bg-primary"
                      >
                        <svg
                          className="size-4 fill-primary transition-colors duration-150 group-hover:fill-ink"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-label="LinkedIn"
                        onClick={(e) => {
                          e.preventDefault()
                          toast.info('LinkedIn em breve.')
                        }}
                        className="group flex size-[30px] cursor-pointer items-center justify-center rounded-[4px] border border-primary transition-colors duration-150 hover:bg-primary"
                      >
                        <svg
                          className="size-4 fill-primary transition-colors duration-150 group-hover:fill-ink"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-label="YouTube"
                        onClick={(e) => {
                          e.preventDefault()
                          toast.info('YouTube em breve.')
                        }}
                        className="group flex size-[30px] cursor-pointer items-center justify-center rounded-[4px] border border-primary transition-colors duration-150 hover:bg-primary"
                      >
                        <svg
                          className="size-4 fill-primary transition-colors duration-150 group-hover:fill-ink"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[12px] lg:h-[54px] lg:w-[228px]">
                    <h5 className="h-[16px] whitespace-nowrap font-mono text-[18px] leading-[16px] font-bold text-foreground">
                      Carteiras compatíveis
                    </h5>
                    <div className="flex h-[26px] w-[228px] items-center justify-center rounded-[6px] border border-line bg-surface-dark px-2 font-mono text-[9px] leading-[12px] font-bold tracking-[0.1px] text-highlight">
                      METAMASK • WALLETCONNECT • COINBASE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="h-[30px] w-full text-center font-mono text-[14px] leading-[30px] font-normal text-foreground">
              © 2026 Kurio. Propriedade digital para todos.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
