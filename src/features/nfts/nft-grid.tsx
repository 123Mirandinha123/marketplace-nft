import type { Nft } from '@/types/api'
import { NftCard } from './nft-card'

export function NftGrid({
  nfts,
  className,
}: {
  nfts: Nft[]
  className?: string
}) {
  return (
    <div
      className={
        className ??
        'mx-auto grid w-full max-w-[366px] grid-cols-2 gap-x-4 gap-y-4 sm:max-w-none lg:grid-cols-3 lg:gap-[34px]'
      }
    >
      {nfts.map((nft, index) => {
        const isOddColumn = index % 2 === 1
        return (
          <div
            key={nft.id}
            className={isOddColumn ? 'md:mt-0 mt-5' : ''}
          >
            <NftCard nft={nft} />
          </div>
        )
      })}
    </div>
  )
}

export function NftGridSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[366px] grid-cols-2 gap-4 sm:max-w-none lg:grid-cols-3 lg:gap-[34px]">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <div className="h-[196px] animate-pulse rounded-[20px] bg-surface-card sm:h-[300px]" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-surface-card" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface-card" />
        </div>
      ))}
    </div>
  )
}
