import Decimal from 'decimal.js'

export const PROMO_CODE = 'KURIO10'
export const PROMO_DISCOUNT = '0.1'
export const NETWORK_FEE_RATE = '0.025'

export function eth(value: Decimal) {
  return value.toFixed(5).replace(/\.?0+$/, '') || '0'
}

export function calculateTotals(
  items: Array<{ unitPriceEth: string; quantity: number }>,
  promoCode: string | null,
) {
  const subtotal = items.reduce(
    (sum, item) => sum.plus(new Decimal(item.unitPriceEth).times(item.quantity)),
    new Decimal(0),
  )
  const discount =
    promoCode?.trim().toUpperCase() === PROMO_CODE
      ? subtotal.times(PROMO_DISCOUNT)
      : new Decimal(0)
  const discounted = subtotal.minus(discount)
  const networkFee = discounted.times(NETWORK_FEE_RATE)
  const total = discounted.plus(networkFee)

  return {
    subtotalEth: eth(subtotal),
    discountEth: eth(discount),
    networkFeeEth: eth(networkFee),
    totalEth: eth(total),
  }
}
