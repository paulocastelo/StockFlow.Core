import { useState } from 'react'
import type { FormEvent } from 'react'
import { loginRequest, registerRequest } from '../api/auth'
import type { AuthMode, AuthResponse, UserProfile } from '../types'
import { formatDateTime } from '../utils/formatters'

type AuthPanelProps = {
  user: UserProfile | null
  expiresAtUtc: string
  onLoginSuccess: (response: AuthResponse) => void
  onRegisterSuccess: () => void
  onSignOut: () => void
  onError: (error: unknown) => void
}

const emptyLogin = { email: '', password: '' }
const emptyRegister = { fullName: '', email: '', password: '' }

export default function AuthPanel({
  user,
  expiresAtUtc,
  onLoginSuccess,
  onRegisterSuccess,
  onSignOut,
  onError,
}: AuthPanelProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [loginForm, setLoginForm] = useState(emptyLogin)
  const [registerForm, setRegisterForm] = useState(emptyRegister)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForms() {
    setAuthMode('login')
    setLoginForm(emptyLogin)
    setRegisterForm(emptyRegister)
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await loginRequest(loginForm)
      onLoginSuccess(response)
      setLoginForm(emptyLogin)
    } catch (error) {
      onError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await registerRequest(registerForm)
      onRegisterSuccess()
      setRegisterForm(emptyRegister)
      setAuthMode('login')
    } catch (error) {
      onError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSignOut() {
    onSignOut()
    resetForms()
  }

  return (
    <section className="auth-panel surface">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">Access</span>
          <h2>Session control</h2>
        </div>
        {user ? (
          <button className="ghost-button" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        ) : null}
      </div>

      {!user ? (
        <>
          <div className="segmented-control">
            <button type="button" className={authMode === 'login' ? 'is-active' : ''} onClick={() => setAuthMode('login')}>
              Login
            </button>
            <button type="button" className={authMode === 'register' ? 'is-active' : ''} onClick={() => setAuthMode('register')}>
              Register
            </button>
          </div>

          {authMode === 'login' ? (
            <form className="stack-form" onSubmit={handleLoginSubmit}>
              <label>
                Email
                <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((previous) => ({ ...previous, email: event.target.value }))} required />
              </label>

              <label>
                Password
                <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} required />
              </label>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form className="stack-form" onSubmit={handleRegisterSubmit}>
              <label>
                Full name
                <input type="text" value={registerForm.fullName} onChange={(event) => setRegisterForm((previous) => ({ ...previous, fullName: event.target.value }))} required />
              </label>

              <label>
                Email
                <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm((previous) => ({ ...previous, email: event.target.value }))} required />
              </label>

              <label>
                Password
                <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm((previous) => ({ ...previous, password: event.target.value }))} required minLength={8} />
              </label>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}
        </>
      ) : (
        <div className="session-card">
          <div>
            <span className="session-label">User</span>
            <strong>{user.fullName}</strong>
            <p>{user.email}</p>
          </div>

          <div>
            <span className="session-label">Session expiry</span>
            <strong>{formatDateTime(expiresAtUtc)}</strong>
          </div>

          <div className="session-note">
            Use Swagger or this web app to exercise the protected endpoints with the same JWT session.
          </div>
        </div>
      )}
    </section>
  )
}
