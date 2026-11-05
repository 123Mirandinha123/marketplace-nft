import { api } from '@/lib/api'
import type { Nft, NftFacets, NftListResponse } from '@/types/api'

export interface NftQueryParams {
  page?: number
  pageSize?: number
  collection?: string
  network?: string
  q?: string
  minPrice?: string
  maxPrice?: string
  sort?: 'recent' | 'price-asc' | 'price-desc' | 'rating'
  tab?: 'all' | 'new' | 'trending'
}

export async function fetchNftsRequest(params?: NftQueryParams) {
  const { data } = await api.get<NftListResponse>('/nfts', { params })
  return data
}

export async function fetchNftRequest(id: string) {
  const { data } = await api.get<Nft>(`/nfts/${id}`)
  return data
}

export async function fetchNftFacetsRequest() {
  const { data } = await api.get<NftFacets>('/nfts/facets')
  return data
}
