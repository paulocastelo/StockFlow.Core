import { useState } from 'react'
import type { Feedback } from '../types'

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  function showSuccess(message: string) {
    setFeedback({ tone: 'success', message })
  }

  function showError(message: string) {
    setFeedback({ tone: 'error', message })
  }

  function dismiss() {
    setFeedback(null)
  }

  return {
    feedback,
    showSuccess,
    showError,
    dismiss,
  }
}
