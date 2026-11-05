import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'

import { formatDate, formatEth } from '@/lib/format'
import { useOrder } from './use-orders'

export function ConfirmationPage({ orderId }: { orderId?: string }) {
  const { data: order, isLoading, isError } = useOrder(orderId ?? null)

  if (!orderId) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1248px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-cream">
          Nenhum pedido selecionado
        </h1>
        <p className="text-sm text-text-secondary">
          Finalize uma compra para acessar o comprovante.
        </p>
        <Link
          to="/mercado"
          className="flex h-[40px] items-center justify-center rounded-[3px] bg-primary px-5 text-[15px] font-bold text-ink"
        >
          Explorar mercado
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1248px] animate-pulse px-6 py-12">
        <div className="h-40 rounded-[8px] bg-surface-card" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1248px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-cream">
          Pedido não encontrado
        </h1>
        <p className="text-sm text-text-secondary">
          O comprovante pode ter expirado ou não pertence à sua conta.
        </p>
        <Link
          to="/mercado"
          className="flex h-[40px] items-center justify-center rounded-[3px] bg-primary px-5 text-[15px] font-bold text-ink"
        >
          Explorar mercado
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-10 px-6 py-10">
      <section className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="size-8" />
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-[12px] tracking-[0.16em] text-primary uppercase">
            Compra confirmada
          </p>
          <h1 className="text-3xl font-bold text-cream">
            Sua obra já é sua.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-text-secondary">
            O NFT foi transferido para a carteira conectada e o comprovante da
            transação está disponível abaixo.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 rounded-[8px] bg-surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/30 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-sand">Pedido</span>
              <span className="text-[20px] font-bold text-cream">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[12px] text-sand">Data</span>
              <span className="text-[14px] text-cream">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={`${item.nftId}-${item.editionId}`} className="flex items-center gap-4">
                <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-surface-raised">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="size-[72px] object-cover"
                    />
                  ) : (
                    <Wallet className="size-6 text-sand" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link
                    to="/nft/$nftId"
                    params={{ nftId: item.nftId }}
                    className="truncate text-[15px] font-bold text-cream hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <span className="text-[13px] text-sand">
                    Edição: {item.editionName} · Qtd. {item.quantity}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-bold text-highlight">
                    {formatEth(item.lineTotalEth)}
                  </p>
                  <p className="text-[12px] text-sand">
                    {formatEth(item.unitPriceEth)} cada
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 border-t border-primary/30 pt-4 text-[14px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-cream">{formatEth(order.subtotalEth, 5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Desconto</span>
              <span className="text-cream">
                {order.discountEth === '0'
                  ? '(-) 0'
                  : `(-) ${formatEth(order.discountEth, 5)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Taxa de rede</span>
              <span className="text-cream">
                {formatEth(order.networkFeeEth, 5)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-[16px]">
              <span className="font-bold text-cream">Total</span>
              <span className="font-bold text-highlight">
                {formatEth(order.totalEth, 5)}
              </span>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-5 rounded-[8px] bg-surface-card p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-[16px] font-bold text-cream">
              Detalhes da transação
            </h2>
            <div className="border-b border-primary/30" />
          </div>
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sand">Rede</span>
              <span className="text-cream">{order.network}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sand">Carteira</span>
              <span className="text-right text-cream">
                {order.wallet.kind} · {order.wallet.address}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sand">Provedor</span>
              <span className="text-cream">{order.wallet.provider}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sand">Hash</span>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(order.transactionHash)
                  toast.success('Hash copiado.')
                }}
                className="flex items-center gap-1.5 truncate text-left text-highlight hover:underline"
              >
                {order.transactionHash.slice(0, 18)}…
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[6px] border border-field p-3 text-[12px] leading-5 text-text-secondary">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Transação simulada e registrada localmente para esta demonstração.
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              to="/mercado"
              className="flex h-[42px] items-center justify-center gap-2 rounded-[6px] bg-primary text-[14px] font-bold text-ink transition-colors hover:bg-highlight"
            >
              Explorar mais NFTs
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/perfil"
              className="flex h-[42px] items-center justify-center gap-2 rounded-[6px] border border-field text-[14px] text-cream transition-colors hover:border-primary"
            >
              Ver meu perfil
              <ExternalLink className="size-4" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
