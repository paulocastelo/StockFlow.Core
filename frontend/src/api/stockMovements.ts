import { apiRequest } from './client'
import type { StockBalance, StockMovement } from '../types'

export function fetchMovementsByProduct(token: string, productId: string): Promise<StockMovement[]> {
  return apiRequest<StockMovement[]>(`/api/stock-movements/product/${productId}`, { token })
}

export function fetchBalance(token: string, productId: string): Promise<StockBalance> {
  return apiRequest<StockBalance>(`/api/stock-movements/product/${productId}/balance`, { token })
}

export function createMovement(
  token: string,
  body: { productId: string; type: number; quantity: number; reason: string | null; performedByUserId: string | null },
): Promise<void> {
  return apiRequest<void>('/api/stock-movements', {
    method: 'POST',
    token,
    body,
  })
}
