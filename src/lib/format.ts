import Decimal from 'decimal.js'

export function formatEth(value: string | number, decimals = 3) {
  const amount = new Decimal(value)
  const formatted = amount.toFixed(decimals).replace(/\.?0+$/, '')

  return `${formatted} ETH`
}

export function formatEthNumber(value: string | number, decimals = 3) {
  return new Decimal(value)
    .toFixed(decimals)
    .replace(/\.?0+$/, '')
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
