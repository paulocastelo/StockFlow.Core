import { apiRequest } from './client'
import type { AuthResponse, UserProfile } from '../types'

export function loginRequest(body: { email: string; password: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
  })
}

export function registerRequest(body: { fullName: string; email: string; password: string }): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/auth/register', {
    method: 'POST',
    body,
  })
}
