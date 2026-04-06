import { apiRequest } from './client'
import type { Category } from '../types'

export function fetchCategories(token: string): Promise<Category[]> {
  return apiRequest<Category[]>('/api/categories', { token })
}

export function createCategory(token: string, body: { name: string; description: string }): Promise<Category> {
  return apiRequest<Category>('/api/categories', {
    method: 'POST',
    token,
    body,
  })
}

export function updateCategory(token: string, id: string, body: { name: string; description: string }): Promise<void> {
  return apiRequest<void>(`/api/categories/${id}`, {
    method: 'PUT',
    token,
    body,
  })
}

export function deleteCategory(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/api/categories/${id}`, {
    method: 'DELETE',
    token,
  })
}
