export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  ensName: string | null
  walletAlias: string | null
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export type NftRarity = 'Raro' | 'Épico' | 'Lendário' | 'Comum'
export type NftNetwork = 'Ethereum' | 'Polygon' | 'Solana'

export interface NftCreator {
  name: string
  address: string
}

export interface NftEdition {
  id: string
  name: string
  totalSupply: number | null
  available: number
}

export interface Nft {
  id: string
  tokenId: string
  title: string
  collection: string
  description: string
  priceEth: string
  rarity: NftRarity
  network: NftNetwork
  attributes: string[]
  gradient: [string, string]
  imageUrl: string | null
  rating: number
  reviews: number
  editions: NftEdition[]
  creator: NftCreator
  contractAddress: string
}

export interface NftListResponse {
  items: Nft[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface NftFacet {
  name: string
  count: number
}

export interface NftFacets {
  collections: NftFacet[]
  networks: NftFacet[]
  priceMinEth: string
  priceMaxEth: string
}

export interface WalletDetails {
  provider: string
  kind: string
  address: string
}

export interface OrderItem {
  nftId: string
  title: string
  imageUrl: string | null
  editionId: string
  editionName: string
  quantity: number
  unitPriceEth: string
  lineTotalEth: string
}

export interface OrderBuyer {
  fullName: string
  email: string
  document: string
  country: string
  referralCode: string | null
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: 'confirmed'
  items: OrderItem[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  promoCode: string | null
  network: NftNetwork
  wallet: WalletDetails
  buyer: OrderBuyer
  transactionHash: string
  createdAt: string
}

export interface CreateOrderRequest {
  items: Array<{
    nftId: string
    editionId: string
    quantity: number
  }>
  network: NftNetwork
  wallet: WalletDetails
  buyer: OrderBuyer
  promoCode: string | null
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface SessionResponse {
  user: User
}
