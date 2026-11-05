import { api, isApiError } from '@/lib/api'
import { clearStoredToken, getStoredToken } from '@/lib/session-storage'
import type {
  AuthResponse,
  SessionResponse,
  User,
} from '@/types/api'
import type { LoginValues, RegisterValues } from './schemas'

export async function loginRequest(values: LoginValues) {
  const { data } = await api.post<AuthResponse>('/auth/login', values)
  return data
}

export async function registerRequest(values: RegisterValues) {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    username: values.username,
    email: values.email,
    password: values.password,
  })
  return data
}

export async function sessionRequest(): Promise<User | null> {
  const token = getStoredToken()
  if (!token) {
    return null
  }

  try {
    const { data } = await api.get<SessionResponse>('/auth/session')
    return data.user
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      clearStoredToken()
      return null
    }

    throw error
  }
}

export async function logoutRequest() {
  await api.post('/auth/logout')
}
