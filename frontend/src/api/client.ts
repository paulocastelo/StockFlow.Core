import type { ApiRequestOptions } from '../types'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers()
  headers.set('Accept', 'application/json')

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const payload = (await safeParseJson(response)) as { detail?: string; title?: string } | null
    throw new ApiError(response.status, payload?.detail ?? payload?.title ?? `Request failed with status ${response.status}.`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await safeParseJson(response)) as T
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error.'
}

async function safeParseJson(response: Response) {
  const raw = await response.text()
  return raw ? (JSON.parse(raw) as unknown) : null
}
