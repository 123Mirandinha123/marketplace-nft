import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useSession } from '@/features/auth/use-auth'
import { useCart } from '@/features/cart/cart-context'
import { useCreateOrder } from '@/features/orders/use-orders'
import { cn } from '@/lib/utils'
import type { NftNetwork, Order } from '@/types/api'

const networkOptions: NftNetwork[] = ['Ethereum', 'Polygon', 'Solana']
const providerOptions = ['MetaMask', 'WalletConnect', 'Coinbase Wallet']
const walletOptions = [
  { id: 'w-1', label: 'Reserva', address: 'nova.kurio.eth', network: 'Polygon' },
  { id: 'w-2', label: 'Principal', address: '0xA91F…E82C', network: 'Ethereum' },
]

const inputClass =
  'h-[40px] w-full min-w-0 rounded-[3px] border border-field bg-transparent px-3 text-[14px] text-cream outline-none placeholder:text-sand focus:border-primary disabled:cursor-not-allowed disabled:opacity-50'

function Field({
  label,
  htmlFor,
  required = true,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <label
          htmlFor={htmlFor}
          className="flex h-[29px] items-center text-[15px] leading-[15px] text-cream"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-[20px] leading-[29px] text-coral">
              *
            </span>
          ) : null}
        </label>
        {children}
      </div>
    </div>
  )
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  required = true,
}: {
  id: string
  label: string
  value: string
  options: Array<string | { value: string; label: string }>
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <Field label={label} htmlFor={id} required={required}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} cursor-pointer appearance-none pr-9`}
        >
          {options.map((option) => {
            const item =
              typeof option === 'string'
                ? { value: option, label: option }
                : option

            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            )
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-sand" />
      </div>
    </Field>
  )
}

export function PaymentPage() {
  const navigate = useNavigate()
  const { data: user } = useSession()
  const { items, totals, promoCode, applyPromo, removePromo, clearCart } =
    useCart()
  const createOrder = useCreateOrder()
  const [completed, setCompleted] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(true)
  const [showPromo, setShowPromo] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [customWallet, setCustomWallet] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    network: (items[0]?.network ?? 'Polygon') as NftNetwork,
    walletId: walletOptions[0].id,
    provider: 'Coinbase Wallet',
    email: user?.email ?? '',
    username: user?.username ?? '',
    profileName: user?.displayName ?? '',
    secondaryWallet: '',
    referralCode: 'KURIO10',
    ensName: user?.ensName?.replace(/\.eth$/, '') ?? '',
    ensDomain: '.eth',
    note: '',
  })

  function update(patch: Partial<typeof form>) {
    setForm((current) => ({ ...current, ...patch }))
  }

  function handlePromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!promoInput.trim()) {
      toast.error('Digite um código promocional.')
      return
    }

    if (applyPromo(promoInput)) {
      toast.success('Código promocional aplicado.')
      setPromoInput('')
      setShowPromo(false)
      return
    }

    toast.error('Código promocional inválido.')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio.')
      return
    }

    if (!walletConnected) {
      toast.error('Conecte a carteira para confirmar.')
      return
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    if (!isMobile) {
      if (
        form.displayName.trim().length < 3 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
        form.username.trim().length < 3 ||
        form.profileName.trim().length < 3 ||
        form.referralCode.trim().length < 4 ||
        form.ensName.trim().length < 2
      ) {
        toast.error('Revise os campos obrigatórios do perfil.')
        return
      }
    }

    const selectedWallet =
      walletOptions.find((option) => option.id === form.walletId) ??
      walletOptions[0]
    const wallet = customWallet
      ? {
          label: form.secondaryWallet || 'Carteira externa',
          address: form.secondaryWallet || '0x0000...0000',
        }
      : selectedWallet

    createOrder.mutate(
      {
        items: items.map((item) => ({
          nftId: item.nftId,
          editionId: item.editionId,
          quantity: item.quantity,
        })),
        network: form.network,
        wallet: {
          provider: form.provider,
          kind: customWallet
            ? 'Externa'
            : wallet.label.includes('Principal')
              ? 'Principal'
              : 'Reserva',
          address: wallet.address,
        },
        buyer: {
          fullName: form.displayName,
          email: form.email,
          document: form.username,
          country: form.profileName,
          referralCode: form.referralCode || null,
        },
        promoCode,
      },
      {
        onSuccess: (order) => {
          clearCart()
          setCompleted(order)
          setDialogOpen(true)
        },
        onError: () => {
          toast.error('Não foi possível concluir a compra. Tente novamente.')
        },
      },
    )
  }

  if (items.length === 0 && !completed) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1248px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-cream">Seu carrinho está vazio</h1>
        <p className="text-sm text-text-secondary">
          Adicione um NFT ao carrinho para iniciar o pagamento.
        </p>
        <Link
          to="/mercado"
          className="flex h-[40px] items-center justify-center rounded-[3px] bg-primary px-5 text-[15px] font-bold text-ink transition-colors hover:bg-highlight"
        >
          Explorar mercado
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE LAYOUT (< md) - Idêntico à imagem de referência    */}
      {/* ========================================================= */}
      <div className="flex w-full flex-col bg-[#140d0a] px-5 py-4 pb-12 md:hidden">
        {/* Header */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Voltar"
            className="flex size-10 items-center justify-center rounded-full bg-[#201511] text-sand shadow-md active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="flex-1 text-center font-mono text-[19px] font-bold text-cream pr-10">
            Pagamento com carteira
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          {/* Carteira conectada */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[14px] font-bold text-cream">
                Carteira conectada
              </span>
              <button
                type="button"
                onClick={() => setCustomWallet(!customWallet)}
                className="font-mono text-[13px] font-bold text-[#d28a4c] hover:underline"
              >
                Trocar carteira
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {walletOptions.map((wallet) => {
                const isSelected = form.walletId === wallet.id
                return (
                  <div
                    key={wallet.id}
                    onClick={() => update({ walletId: wallet.id })}
                    className={cn(
                      'relative flex cursor-pointer items-start justify-between rounded-[16px] border bg-[#201511] p-4 shadow-lg transition-all',
                      isSelected ? 'border-[#d28a4c]/60 ring-1 ring-[#d28a4c]/40' : 'border-field/40',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio customizado */}
                      <span className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-[#d28a4c]">
                        {isSelected && <span className="size-2 rounded-full bg-[#d28a4c]" />}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[14px] font-bold text-cream">
                          {wallet.label}
                        </span>
                        <span className="font-mono text-[13px] text-text-secondary">
                          {user?.ensName || 'nova.kurio.eth'}
                        </span>
                        <span className="font-mono text-[12px] text-sand/80">
                          {wallet.network === 'Ethereum' ? 'Rede principal Ethereum' : `Rede ${wallet.network}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Opções da carteira"
                      className="text-sand/70 hover:text-cream"
                    >
                      <span className="text-lg leading-none">⋮</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Carteira e rede */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="font-mono text-[14px] font-bold text-cream">
              Carteira e rede
            </span>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'WalletConnect', label: 'WalletConnect', initial: 'W' },
                { id: 'MetaMask', label: 'MetaMask', initial: 'M' },
                { id: 'Coinbase Wallet', label: 'Coinbase Wallet', initial: 'C' },
              ].map((prov) => {
                const isSelected = form.provider === prov.id
                return (
                  <div
                    key={prov.id}
                    onClick={() => update({ provider: prov.id })}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-[16px] border bg-[#201511] px-4 py-3.5 shadow-md transition-all',
                      isSelected ? 'border-[#d28a4c]/60' : 'border-field/40',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-[#2f1d15] font-mono text-[13px] font-bold text-[#d28a4c]">
                        {prov.initial}
                      </span>
                      <span className="font-mono text-[14px] text-cream">
                        {prov.label}
                      </span>
                    </div>

                    <span className="flex size-4 items-center justify-center rounded-full border border-[#d28a4c]">
                      {isSelected && <span className="size-2 rounded-full bg-[#d28a4c]" />}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Total e Botão */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-end gap-3 font-mono">
              <span className="text-[15px] font-normal text-text-secondary">
                Total:
              </span>
              <span className="text-[20px] font-bold text-[#d28a4c]">
                {totals.totalEth} ETH
              </span>
            </div>

            <button
              type="submit"
              disabled={createOrder.isPending}
              className="flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[40px] bg-[#b87035] font-mono text-[16px] font-bold text-ink shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createOrder.isPending ? 'Confirmando…' : 'Confirmar compra'}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (md:flex)                                  */}
      {/* ========================================================= */}
      <div className="mx-auto hidden w-full max-w-[1248px] flex-col gap-[96px] px-6 py-6 md:flex">
        <section aria-label="Página de Pagamento" className="flex flex-col gap-8">
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
            <span>/</span>
            <span>Pagamento</span>
          </nav>
          <h1 className="sr-only">Pagamento</h1>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"
          >
            <div className="flex w-full flex-1 flex-col gap-6 lg:max-w-[763px]">
              <h2 className="text-[17px] leading-4 font-bold text-cream">
                Perfil do colecionador
              </h2>

              <div className="flex flex-col gap-6">
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Nome de exibição" htmlFor="displayName">
                    <input
                      id="displayName"
                      name="displayName"
                      autoComplete="name"
                      value={form.displayName}
                      onChange={(event) =>
                        update({ displayName: event.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <SelectField
                    id="network"
                    label="Rede"
                    value={form.network}
                    options={networkOptions}
                    onChange={(value) =>
                      update({ network: value as NftNetwork })
                    }
                  />
                  <SelectField
                    id="walletId"
                    label="Endereço da carteira"
                    value={form.walletId}
                    options={walletOptions.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                    onChange={(value) => update({ walletId: value })}
                  />
                  <SelectField
                    id="provider"
                    label="Tipo de carteira"
                    value={form.provider}
                    options={providerOptions}
                    onChange={(value) => update({ provider: value })}
                  />
                  <Field label="E-mail" htmlFor="email">
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => update({ email: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Nome de usuário" htmlFor="username">
                    <input
                      id="username"
                      value={form.username}
                      onChange={(event) =>
                        update({ username: event.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Nome do perfil" htmlFor="profileName">
                    <input
                      id="profileName"
                      value={form.profileName}
                      onChange={(event) =>
                        update({ profileName: event.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="ENS ou carteira secundária"
                    htmlFor="secondaryWallet"
                    required={false}
                  >
                    <input
                      id="secondaryWallet"
                      value={form.secondaryWallet}
                      onChange={(event) =>
                        update({ secondaryWallet: event.target.value })
                      }
                      placeholder="(opcional)"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Código de indicação" htmlFor="referralCode">
                    <input
                      id="referralCode"
                      value={form.referralCode}
                      onChange={(event) =>
                        update({ referralCode: event.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Nome ENS" htmlFor="ensName">
                    <div className="flex">
                      <input
                        id="ensName"
                        value={form.ensName}
                        onChange={(event) =>
                          update({ ensName: event.target.value })
                        }
                        className={`${inputClass} rounded-r-none`}
                      />
                      <select
                        aria-label="Domínio ENS"
                        value={form.ensDomain}
                        onChange={(event) =>
                          update({ ensDomain: event.target.value })
                        }
                        className="h-[40px] rounded-r-[3px] border border-l-0 border-field bg-transparent px-2 text-[14px] text-cream outline-none focus:border-primary"
                      >
                        {['.eth', '.xyz', '.id'].map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Field>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomWallet((current) => !current)}
                    className="flex w-fit items-center gap-2 text-left text-[15px] text-cream"
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded-[3px] border ${
                        customWallet
                          ? 'border-primary bg-primary text-ink'
                          : 'border-field'
                      }`}
                    >
                      {customWallet ? <Check className="size-3" /> : null}
                    </span>
                    Usar outra carteira?
                  </button>

                  {customWallet ? (
                    <input
                      id="secondaryWallet"
                      name="secondaryWallet"
                      autoComplete="off"
                      value={form.secondaryWallet}
                      onChange={(event) =>
                        update({ secondaryWallet: event.target.value })
                      }
                      placeholder="Endereço da carteira externa"
                      className={inputClass}
                    />
                  ) : null}

                  <label
                    htmlFor="note"
                    className="text-[15px] leading-[15px] text-cream"
                  >
                    Observação do colecionador (opcional)
                  </label>
                  <textarea
                    id="note"
                    value={form.note}
                    onChange={(event) => update({ note: event.target.value })}
                    rows={3}
                    placeholder="Alguma observação para o criador?"
                    className="w-full resize-none rounded-[3px] border border-field bg-transparent px-3 py-2 text-[14px] text-cream outline-none placeholder:text-sand focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <aside className="flex w-full flex-col gap-6 lg:w-[380px] lg:shrink-0">
              <div className="flex flex-col gap-3">
                <h2 className="text-[17px] leading-4 font-bold text-cream">
                  Seus NFTs
                </h2>
                <div className="w-full border-b border-primary/30" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[14px] text-cream">
                  <span>NFTs</span>
                  <span>Subtotal</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.key} className="flex items-center gap-3">
                      <div className="flex size-[48px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-surface-card">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="size-[48px] object-cover"
                          />
                        ) : (
                          <Wallet className="size-5 text-sand" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14px] font-medium text-cream">
                          {item.title}
                        </span>
                        <span className="text-[12px] text-sand">
                          ID do token: #{item.nftId.replace('nft-', '').padStart(4, '0')}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[12px] text-sand">
                          (x {item.quantity})
                        </span>
                        <span className="text-[14px] font-bold text-cream">
                          {(Number(item.unitPriceEth) * item.quantity).toFixed(5).replace(/\.?0+$/, '')} ETH
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                {promoCode ? (
                  <div className="flex items-center justify-between rounded-[3px] border border-primary px-3 py-2 text-[13px]">
                    <span className="font-bold text-highlight">
                      {promoCode} aplicado
                    </span>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-sand hover:text-cream"
                    >
                      Remover
                    </button>
                  </div>
                ) : showPromo ? (
                  <form onSubmit={handlePromo} className="flex h-[40px]">
                    <input
                      id="payment-promo-input"
                      name="paymentPromo"
                      autoComplete="off"
                      value={promoInput}
                      onChange={(event) => setPromoInput(event.target.value)}
                      placeholder="Código promocional"
                      aria-label="Código promocional"
                      className="h-full min-w-0 flex-1 rounded-l-[3px] border border-primary bg-transparent px-2 text-[12px] text-cream outline-none placeholder:text-sand"
                    />
                    <button
                      type="submit"
                      className="h-full shrink-0 rounded-r-[3px] bg-primary px-3 text-[13px] font-bold text-ink"
                    >
                      Aplicar
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPromo(true)}
                    className="text-left text-[14px] text-cream underline-offset-4 hover:text-highlight hover:underline"
                  >
                    Tem um código promocional? Aplique aqui
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] leading-5 text-cream">
                    Subtotal
                  </span>
                  <span className="text-[16px] text-cream">
                    {totals.subtotalEth} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] leading-5 text-cream">
                    Desconto do lançamento
                  </span>
                  <span className="text-[15px] text-cream">
                    {totals.discountEth === '0'
                      ? '(-) 0'
                      : `(-) ${totals.discountEth}`}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] leading-5 text-cream">
                      Taxa de rede
                    </span>
                    <span className="text-[16px] text-cream">
                      {totals.networkFeeEth} ETH
                    </span>
                  </div>
                  <span className="text-right text-[12px] text-highlight">
                    Taxa estimada
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[16px] font-bold text-cream">
                    Total
                  </span>
                  <span className="text-[18px] font-bold text-highlight">
                    {totals.totalEth} ETH
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-primary/30 pt-4">
                <h3 className="w-full text-center text-[17px] leading-4 font-bold text-cream">
                  Carteira e rede
                </h3>
                <p className="text-center text-[11px] tracking-[0.08em] text-text-secondary uppercase">
                  METAMASK • WALLETCONNECT • COINBASE
                </p>
                <div className="flex flex-col gap-2">
                  {providerOptions.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => update({ provider })}
                      className={`flex h-[45px] w-full items-center gap-2.5 rounded-[3px] border px-3 text-left text-[14px] transition-colors ${
                        form.provider === provider
                          ? 'border-primary text-cream'
                          : 'border-field text-text-secondary hover:border-primary/60'
                      }`}
                    >
                      <CreditCard className="size-4 text-sand" />
                      {provider}
                    </button>
                  ))}
                </div>

                {walletConnected ? (
                  <div className="flex flex-col gap-3 rounded-[3px] border border-field p-3">
                    <div className="flex items-center gap-2 text-[13px] text-cream">
                      <ShieldCheck className="size-4 text-primary" />
                      Carteira conectada · {form.network}
                    </div>
                    <button
                      type="button"
                      onClick={() => setWalletConnected(false)}
                      className="text-left text-[13px] text-highlight hover:underline"
                    >
                      Desconectar carteira
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setWalletConnected(true)
                      toast.success('Carteira conectada com sucesso.')
                    }}
                    className="flex h-[40px] w-full items-center justify-center rounded-[6px] border border-primary text-[14px] font-bold text-highlight transition-colors hover:bg-primary/10"
                  >
                    Conectar carteira
                  </button>
                )}

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="flex h-[45px] w-full items-center justify-center gap-2 rounded-[8px] bg-primary text-[15px] font-bold text-ink transition-colors hover:bg-highlight disabled:opacity-60"
                >
                  {createOrder.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : null}
                  Confirmar compra
                </button>
                <p className="text-center text-xs text-text-secondary">
                  {walletConnected
                    ? 'Revise os dados e confirme para finalizar.'
                    : 'Conecte a carteira para confirmar.'}
                </p>
              </div>
            </aside>
          </form>
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 z-50 flex h-full max-h-[100dvh] w-full max-w-full flex-col overflow-y-auto rounded-none border-0 bg-[#1e1410] p-6 text-cream shadow-2xl md:static md:inset-auto md:h-auto md:max-h-[95vh] md:w-[92vw] md:max-w-[480px] md:rounded-[20px] md:border md:border-field/40"
        >
          {/* Botão X de fechar no canto superior direito */}
          <button
            type="button"
            onClick={() => {
              setDialogOpen(false)
              navigate({ to: '/' })
            }}
            aria-label="Fechar"
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-sand/80 hover:text-cream"
          >
            <span className="text-xl leading-none">✕</span>
          </button>

          {/* Envelope Thank You Icon */}
          <div className="flex flex-col items-center pt-2 text-center">
            <svg
              viewBox="0 0 64 64"
              className="size-16 text-[#d28a4c]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="8" y="18" width="48" height="34" rx="4" />
              <path d="M8 22l24 16 24-16" />
              <path d="M16 18v-6a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v6" />
              <text
                x="32"
                y="14"
                textAnchor="middle"
                fontSize="6"
                fontWeight="bold"
                fill="currentColor"
                stroke="none"
              >
                THANK
              </text>
              <text
                x="32"
                y="20"
                textAnchor="middle"
                fontSize="5"
                fontWeight="bold"
                fill="currentColor"
                stroke="none"
              >
                YOU
              </text>
            </svg>

            <h2 className="mt-3 font-mono text-[16px] font-bold text-cream">
              Seus NFTs agora estão na sua carteira
            </h2>
          </div>

          {/* Grid superior de metadados: ID, Data, Total, Carteira */}
          <div className="mt-5 grid grid-cols-4 divide-x divide-primary/30 border-y border-primary/30 py-3 text-center font-mono">
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-sand sm:text-[11px]">ID da transação</span>
              <span className="truncate text-[11px] font-medium text-cream sm:text-[12px]">
                {completed ? completed.wallet.address.slice(0, 6) + '…' + completed.wallet.address.slice(-4) : '0xA91F…E82C'}
              </span>
            </div>
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-sand sm:text-[11px]">Data</span>
              <span className="text-[11px] font-medium text-cream sm:text-[12px]">
                {completed ? new Date(completed.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '29 Jul, 2026'}
              </span>
            </div>
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-sand sm:text-[11px]">Total</span>
              <span className="text-[11px] font-medium text-cream sm:text-[12px]">
                {completed ? `${completed.totalEth} ETH` : '26.846 ETH'}
              </span>
            </div>
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-sand sm:text-[11px]">Carteira</span>
              <span className="text-[11px] font-medium text-cream sm:text-[12px]">
                {completed ? completed.wallet.provider : 'MetaMask'}
              </span>
            </div>
          </div>

          {/* Detalhes da transação */}
          <div className="mt-5 flex flex-col font-mono">
            <h3 className="text-[13px] font-bold text-cream">Detalhes da transação</h3>
            <div className="mt-2 flex items-center justify-between border-b border-primary/30 pb-2 text-[12px] font-bold text-cream">
              <span>NFTs</span>
              <div className="flex gap-8">
                <span>Edições</span>
                <span>Subtotal</span>
              </div>
            </div>

            {/* Lista de itens comprados */}
            <div className="mt-3 flex flex-col gap-3">
              {(completed?.items ?? []).length > 0 ? (
                completed!.items.map((item) => (
                  <div key={item.nftId + item.editionId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-11 shrink-0 overflow-hidden rounded-[8px] bg-black/40">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-surface-card" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate text-[13px] font-bold text-cream">{item.title}</span>
                        <span className="text-[11px] text-sand">ID do token: #{item.nftId.replace('nft-', '').padStart(4, '0')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <span className="text-[13px] text-sand">(x {item.quantity})</span>
                      <span className="min-w-[65px] text-right text-[14px] font-bold text-[#d28a4c]">
                        {item.lineTotalEth} ETH
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-11 shrink-0 rounded-[8px] bg-black/40" />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-cream">Emerald Ape #042</span>
                      <span className="text-[11px] text-sand">ID do token: #0042</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-[13px] text-sand">(x 1)</span>
                    <span className="text-[14px] font-bold text-[#d28a4c]">1.19 ETH</span>
                  </div>
                </div>
              )}
            </div>

            {/* Taxa de rede e Total */}
            <div className="mt-4 flex flex-col gap-1 border-t border-primary/20 pt-3 text-[13px]">
              <div className="flex justify-between text-sand">
                <span className="text-right flex-1 pr-6 text-cream">Taxa de rede</span>
                <span className="text-cream">{completed ? `${completed.networkFeeEth} ETH` : '0.016 ETH'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-right flex-1 pr-6 text-cream">Total</span>
                <span className="text-[#d28a4c]">{completed ? `${completed.totalEth} ETH` : '1.206 ETH'}</span>
              </div>
            </div>

            <p className="mt-4 border-t border-primary/20 pt-3 text-center text-[12px] leading-relaxed text-sand">
              Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
            </p>

            {/* Botão Ver no Etherscan */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false)
                  navigate({ to: '/' })
                }}
                className="flex h-[42px] px-8 cursor-pointer items-center justify-center rounded-[8px] bg-[#cf8a48] font-mono text-[14px] font-bold text-ink shadow transition-opacity hover:opacity-90 active:scale-95"
              >
                Ver no Etherscan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
