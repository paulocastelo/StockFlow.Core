import type { UserProfile } from '../types'

type HeroProps = {
  token: string
  user: UserProfile | null
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export default function Hero({ token, user }: HeroProps) {
  return (
    <header className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">StockFlow Core</span>
        <h1>Inventory control with a clean operational cockpit.</h1>
        <p>
          This web MVP connects directly to the ASP.NET Core API and supports authentication, category and
          product management, stock entries, stock exits, balance lookup, and movement history.
        </p>
      </div>

      <div className="status-card">
        <span className="status-label">Backend status</span>
        <strong>{token ? 'Connected with JWT session' : 'Ready for sign-in'}</strong>
        <p>API base URL: {apiBaseUrl}</p>
        {user ? <p>Signed in as {user.fullName}</p> : <p>Use the auth panel to begin operating the workspace.</p>}
      </div>
    </header>
  )
}
