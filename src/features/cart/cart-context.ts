import { createContext, useContext } from 'react'

import type { Nft, NftEdition } from '@/types/api'
import type { calculateTotals } from './totals'

export interface CartItem {
  key: string
  nftId: string
  title: string
  imageUrl: string | null
  collection: string
  network: Nft['network']
  editionId: string
  editionName: string
  unitPriceEth: string
  quantity: number
  maxQuantity: number
}

export interface AddCartItemInput {
  nft: Nft
  edition: NftEdition
  quantity: number
}

export interface CartContextValue {
  items: CartItem[]
  count: number
  promoCode: string | null
  totals: ReturnType<typeof calculateTotals>
  addItem: (input: AddCartItemInput) => void
  setQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clearCart: () => void
  applyPromo: (code: string) => boolean
  removePromo: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
