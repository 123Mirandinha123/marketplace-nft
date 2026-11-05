import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  CartContext,
  type AddCartItemInput,
  type CartItem,
} from './cart-context'
import { calculateTotals, PROMO_CODE } from './totals'

const CART_STORAGE_KEY = 'kurio.cart.v1'

interface CartState {
  items: CartItem[]
  promoCode: string | null
}

function cartKey(nftId: string, editionId: string) {
  return `${nftId}:${editionId}`
}

function loadCart(): CartState {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)

    if (!raw) {
      return { items: [], promoCode: null }
    }

    const parsed = JSON.parse(raw) as Partial<CartState>

    return {
      items: Array.isArray(parsed.items)
        ? parsed.items.filter((item) => item && item.key && item.nftId)
        : [],
      promoCode: typeof parsed.promoCode === 'string' ? parsed.promoCode : null,
    }
  } catch {
    return { items: [], promoCode: null }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(loadCart)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addItem = useCallback(
    ({ nft, edition, quantity }: AddCartItemInput) => {
      const key = cartKey(nft.id, edition.id)
      const maxQuantity = Math.max(1, edition.available)

      setState((current) => {
        const existing = current.items.find((item) => item.key === key)

        if (existing) {
          return {
            ...current,
            items: current.items.map((item) =>
              item.key === key
                ? {
                    ...item,
                    quantity: Math.min(
                      item.maxQuantity,
                      item.quantity + Math.max(1, quantity),
                    ),
                  }
                : item,
            ),
          }
        }

        return {
          ...current,
          items: [
            ...current.items,
            {
              key,
              nftId: nft.id,
              title: nft.title,
              imageUrl: nft.imageUrl,
              collection: nft.collection,
              network: nft.network,
              editionId: edition.id,
              editionName: edition.name,
              unitPriceEth: nft.priceEth,
              quantity: Math.min(maxQuantity, Math.max(1, quantity)),
              maxQuantity,
            },
          ],
        }
      })
    },
    [],
  )

  const setQuantity = useCallback((key: string, quantity: number) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.min(
                item.maxQuantity,
                Math.max(1, Math.floor(quantity)),
              ),
            }
          : item,
      ),
    }))
  }, [])

  const removeItem = useCallback((key: string) => {
    setState((current) => ({
      ...current,
      items: current.items.filter((item) => item.key !== key),
    }))
  }, [])

  const clearCart = useCallback(() => {
    setState({ items: [], promoCode: null })
  }, [])

  const applyPromo = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase()

    if (normalized !== PROMO_CODE) {
      return false
    }

    setState((current) => ({ ...current, promoCode: normalized }))
    return true
  }, [])

  const removePromo = useCallback(() => {
    setState((current) => ({ ...current, promoCode: null }))
  }, [])

  const totals = useMemo(
    () => calculateTotals(state.items, state.promoCode),
    [state.items, state.promoCode],
  )
  const count = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  )

  const value = useMemo(
    () => ({
      items: state.items,
      count,
      promoCode: state.promoCode,
      totals,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      applyPromo,
      removePromo,
    }),
    [
      state.items,
      state.promoCode,
      count,
      totals,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      applyPromo,
      removePromo,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
