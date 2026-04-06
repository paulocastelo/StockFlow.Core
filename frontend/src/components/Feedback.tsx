import type { Feedback as FeedbackType } from '../types'

type FeedbackProps = {
  feedback: FeedbackType | null
  onDismiss: () => void
}

export default function Feedback({ feedback, onDismiss }: FeedbackProps) {
  if (!feedback) {
    return null
  }

  return (
    <div className={`feedback feedback--${feedback.tone}`}>
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  )
}
