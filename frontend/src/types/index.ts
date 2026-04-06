export type Section = 'overview' | 'categories' | 'products' | 'movements'

export type AuthMode = 'login' | 'register'

export type UserProfile = {
  id: string
  fullName: string
  email: string
  isActive: boolean
}

export type AuthResponse = {
  accessToken: string
  expiresAtUtc: string
  user: UserProfile
}

export type Category = {
  id: string
  name: string
  description: string | null
}

export type Product = {
  id: string
  categoryId: string
  name: string
  sku: string
  unitPrice: number
  isActive: boolean
}

export type StockMovement = {
  id: string
  productId: string
  type: number
  quantity: number
  reason: string | null
  occurredAtUtc: string
}

export type StockBalance = {
  productId: string
  currentBalance: number
}

export type Feedback = {
  tone: 'success' | 'error'
  message: string
}

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
}

export type SectionMeta = {
  title: string
  description: string
}
