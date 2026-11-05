import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { clearStoredToken, getStoredToken, storeToken } from '@/lib/session-storage'
import { loginRequest, logoutRequest, registerRequest, sessionRequest } from './api'
import type { RegisterValues } from './schemas'
import type { User, WalletDetails } from '@/types/api'

export const sessionQueryKey = ['session'] as const

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: sessionRequest,
    staleTime: 60_000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      storeToken(data.token)
      queryClient.setQueryData<User | null>(sessionQueryKey, data.user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: RegisterValues) => registerRequest(values),
    onSuccess: (data) => {
      storeToken(data.token)
      queryClient.setQueryData<User | null>(sessionQueryKey, data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearStoredToken()
      queryClient.setQueryData<User | null>(sessionQueryKey, null)
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: Partial<Pick<User, 'displayName' | 'username' | 'email' | 'ensName' | 'walletAlias' | 'avatarUrl'>>) => {
      const { data } = await api.patch<User>('/auth/profile', values)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<User | null>(sessionQueryKey, data)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (values: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.post<{ success: boolean; message: string }>('/auth/change-password', values)
      return data
    },
  })
}

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const { data } = await api.get<WalletDetails[]>('/auth/wallets')
      return data
    },
    enabled: !!getStoredToken(),
  })
}

export function useAddWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (address: string) => {
      const { data } = await api.post<WalletDetails>('/auth/wallets', { address })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useRemoveWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (address: string) => {
      await api.delete(`/auth/wallets/${encodeURIComponent(address)}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

