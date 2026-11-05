import { api } from '@/lib/api'
import type { CreateOrderRequest, Order } from '@/types/api'

export async function createOrderRequest(payload: CreateOrderRequest) {
  const { data } = await api.post<Order>('/orders', payload)
  return data
}

export async function fetchOrderRequest(id: string) {
  const { data } = await api.get<Order>(`/orders/${id}`)
  return data
}
