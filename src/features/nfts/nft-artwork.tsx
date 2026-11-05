import { cn } from '@/lib/utils'
import type { Nft } from '@/types/api'

export function NftArtwork({
  nft,
  className,
  imageClassName,
  showRarity = false,
  priority = false,
}: {
  nft: Pick<Nft, 'gradient' | 'title' | 'rarity'> & {
    imageUrl?: string | null
  }
  className?: string
  imageClassName?: string
  showRarity?: boolean
  priority?: boolean
}) {
  const [from, to] = nft.gradient

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-lg border border-white/5 bg-surface',
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 28% 18%, ${to}66 0%, transparent 42%), radial-gradient(circle at 82% 78%, ${from} 0%, transparent 55%), linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      {nft.imageUrl ? (
        <img
          src={nft.imageUrl}
          alt={`Arte digital de ${nft.title}`}
          className={cn('size-full object-cover', imageClassName)}
          loading={priority ? 'eager' : 'lazy'}
        />
      ) : (
        <>
          <div
            className="absolute -top-1/4 left-1/2 h-[85%] w-[85%] -translate-x-1/2 rotate-45 rounded-[38%] border border-white/15 bg-white/5"
            aria-hidden="true"
          />
          <div
            className="absolute -right-1/5 bottom-0 size-[62%] rounded-full border border-white/15 bg-black/10"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-25 mix-blend-soft-light"
            aria-hidden="true"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 1px, transparent 1px 9px)',
            }}
          />
        </>
      )}
      {showRarity ? (
        <span className="absolute top-3 right-3 rounded-sm bg-primary px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-primary-foreground">
          {nft.rarity.toUpperCase()}
        </span>
      ) : null}
    </div>
  )
}
