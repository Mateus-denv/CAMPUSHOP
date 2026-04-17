// Sistema de listeners para monitorar mudanças de autenticação
type AuthListener = () => void

const listeners = new Set<AuthListener>()

export function addAuthListener(listener: AuthListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifyAuthChange() {
  listeners.forEach(listener => listener())
}

export function hasAuthToken(): boolean {
  return !!localStorage.getItem('token')
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  notifyAuthChange()
}
