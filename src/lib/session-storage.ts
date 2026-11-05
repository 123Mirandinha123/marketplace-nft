const TOKEN_KEY = 'kurio.session.token'

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}
