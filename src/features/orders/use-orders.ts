import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateOrderRequest } from '@/types/api'
import { createOrderRequest, fetchOrderRequest } from './api'

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => fetchOrderRequest(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => createOrderRequest(payload),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', order.id], order)
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
    },
  })
}
