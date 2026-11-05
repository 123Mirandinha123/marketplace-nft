import { useQuery } from '@tanstack/react-query'

import type { NftQueryParams } from './api'
import {
  fetchNftFacetsRequest,
  fetchNftRequest,
  fetchNftsRequest,
} from './api'

export function useNfts(params?: NftQueryParams) {
  return useQuery({
    queryKey: ['nfts', params ?? {}],
    queryFn: () => fetchNftsRequest(params),
    placeholderData: (previous) => previous,
  })
}

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: () => fetchNftRequest(id),
    enabled: Boolean(id),
  })
}

export function useNftFacets() {
  return useQuery({
    queryKey: ['nfts', 'facets'],
    queryFn: fetchNftFacetsRequest,
    staleTime: 60_000,
  })
}
