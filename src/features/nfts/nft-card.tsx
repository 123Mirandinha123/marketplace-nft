import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { formatEth } from '@/lib/format'
import type { Nft } from '@/types/api'
import { NftArtwork } from './nft-artwork'

export function NftCard({ nft }: { nft: Nft }) {
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <article className="relative flex w-full flex-col gap-2 xl:w-[258px]">
      <button
        type="button"
        className="absolute top-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-full border border-sand/40 bg-black/40 text-sand shadow-sm transition-transform active:scale-90 sm:top-3 sm:right-3 sm:size-9 sm:rounded-[5px] sm:border-0 sm:bg-ink"
        aria-label={`Favoritar ${nft.title}`}
        onClick={() => {
          setIsFavorited(!isFavorited)
          toast.info(
            !isFavorited
              ? 'Adicionado aos favoritos!'
              : 'Removido dos favoritos!'
          )
        }}
      >
        <Heart
          className={`size-3.5 transition-colors sm:size-5 ${
            isFavorited
              ? 'fill-[#d28a4c] text-[#d28a4c]'
              : 'hover:text-highlight'
          }`}
        />
      </button>

      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="group flex flex-col gap-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="relative flex h-[196px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#241612] p-1.5 shadow-md sm:h-[300px] sm:rounded-none sm:p-0 xl:w-[258px]">
          {nft.rarity !== 'Comum' ? (
            <span className="absolute top-0 left-0 z-10 rounded-br-[12px] bg-[#d28a4c] px-2.5 py-1 text-[11px] font-bold tracking-wider text-ink uppercase sm:rounded-br-[8px] sm:text-[12px]">
              {nft.rarity}
            </span>
          ) : null}
          <NftArtwork
            nft={nft}
            priority={nft.id === 'nft-1'}
            className="size-full rounded-[20px] object-cover sm:size-[250px] sm:rounded-[15px]"
          />
        </div>
        <div className="flex w-full flex-col gap-0.5 px-0.5 sm:gap-1 sm:px-0">
          <h3 className="truncate font-mono text-[13px] leading-5 font-normal text-cream/70 transition-colors group-hover:text-highlight sm:text-[16px] sm:leading-4">
            {nft.title}
          </h3>
          <p className="font-mono text-[16px] leading-5 font-bold text-[#d28a4c] sm:text-[18px]">
            {formatEth(nft.priceEth)}
          </p>
        </div>
      </Link>
    </article>
  )
}
