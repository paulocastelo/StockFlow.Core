import { apiRequest } from './client'
import type { Product } from '../types'

export function fetchProducts(token: string): Promise<Product[]> {
  return apiRequest<Product[]>('/api/products', { token })
}

export function createProduct(
  token: string,
  body: { categoryId: string; name: string; sku: string; unitPrice: number },
): Promise<Product> {
  return apiRequest<Product>('/api/products', {
    method: 'POST',
    token,
    body,
  })
}

export function updateProduct(
  token: string,
  id: string,
  body: { categoryId: string; name: string; sku: string; unitPrice: number; isActive: boolean },
): Promise<void> {
  return apiRequest<void>(`/api/products/${id}`, {
    method: 'PUT',
    token,
    body,
  })
}
