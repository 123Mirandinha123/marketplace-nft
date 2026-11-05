import axios from 'axios'

import { clearStoredToken, getStoredToken } from '@/lib/session-storage'
import type { ApiErrorBody } from '@/types/api'

export class ApiError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>

  constructor(
    message: string,
    status = 0,
    code = 'NETWORK_ERROR',
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 12_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const status = error.response?.status ?? 0
      const body = error.response?.data
      const code = body?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'REQUEST_FAILED')
      const message =
        body?.message ??
        (status === 0
          ? 'Não foi possível conectar. Verifique sua rede.'
          : 'Não foi possível concluir a solicitação.')

      if (status === 401) {
        clearStoredToken()
      }

      return Promise.reject(new ApiError(message, status, code, body?.details))
    }

    return Promise.reject(
      new ApiError('Ocorreu um erro inesperado. Tente novamente.'),
    )
  },
)

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
