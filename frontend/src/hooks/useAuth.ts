import { useState } from 'react'
import type { AuthResponse, UserProfile } from '../types'

export function useAuth() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('stockflow.token') ?? '')
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('stockflow.user')
    return raw ? (JSON.parse(raw) as UserProfile) : null
  })
  const [expiresAtUtc, setExpiresAtUtc] = useState<string>(() => localStorage.getItem('stockflow.expiresAtUtc') ?? '')

  function persistSession(response: AuthResponse) {
    localStorage.setItem('stockflow.token', response.accessToken)
    localStorage.setItem('stockflow.user', JSON.stringify(response.user))
    localStorage.setItem('stockflow.expiresAtUtc', response.expiresAtUtc)

    setToken(response.accessToken)
    setUser(response.user)
    setExpiresAtUtc(response.expiresAtUtc)
  }

  function clearSession() {
    localStorage.removeItem('stockflow.token')
    localStorage.removeItem('stockflow.user')
    localStorage.removeItem('stockflow.expiresAtUtc')

    setToken('')
    setUser(null)
    setExpiresAtUtc('')
  }

  return {
    token,
    user,
    expiresAtUtc,
    persistSession,
    clearSession,
  }
}
