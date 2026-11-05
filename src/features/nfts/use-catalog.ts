import { useCallback, useMemo, useState } from 'react'

import type { NftQueryParams } from './api'
import { useNftFacets, useNfts } from './use-nfts'

export type CatalogSort = NonNullable<NftQueryParams['sort']>

const PAGE_SIZE = 9

export function useCatalog() {
  const [q, setQState] = useState('')
  const [collection, setCollectionState] = useState('')
  const [network, setNetworkState] = useState('')
  const [sort, setSortState] =
    useState<NonNullable<NftQueryParams['sort']>>('recent')
  const [tab, setTabState] =
    useState<NonNullable<NftQueryParams['tab']>>('all')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const setQ = useCallback((value: string) => {
    setQState(value)
    setPage(1)
  }, [])

  const setCollection = useCallback((value: string) => {
    setCollectionState(value)
    setPage(1)
  }, [])

  const setNetwork = useCallback((value: string) => {
    setNetworkState(value)
    setPage(1)
  }, [])

  const setSort = useCallback(
    (value: NonNullable<NftQueryParams['sort']>) => {
      setSortState(value)
      setPage(1)
    },
    [],
  )

  const setTab = useCallback((value: NonNullable<NftQueryParams['tab']>) => {
    setTabState(value)
    setPage(1)
  }, [])

  const applyPrice = useCallback((value: [number, number]) => {
    setPriceRange(value)
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setQState('')
    setCollectionState('')
    setNetworkState('')
    setPriceRange(null)
    setTabState('all')
    setPage(1)
  }, [])

  const query = useMemo<NftQueryParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      q: q || undefined,
      collection: collection || undefined,
      network: network || undefined,
      sort,
      tab,
      minPrice: priceRange ? String(priceRange[0]) : undefined,
      maxPrice: priceRange ? String(priceRange[1]) : undefined,
    }),
    [page, q, collection, network, sort, tab, priceRange],
  )

  const nfts = useNfts(query)
  const facets = useNftFacets()
  const totalPages = Math.max(
    1,
    Math.ceil((nfts.data?.total ?? 0) / PAGE_SIZE),
  )

  return {
    q,
    setQ,
    collection,
    setCollection,
    network,
    setNetwork,
    sort,
    setSort,
    tab,
    setTab,
    priceRange,
    applyPrice,
    clearFilters,
    page,
    setPage,
    totalPages,
    filtersOpen,
    setFiltersOpen,
    nfts,
    facets,
  }
}

export type CatalogController = ReturnType<typeof useCatalog>
