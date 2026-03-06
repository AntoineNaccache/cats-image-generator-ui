import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  mode: AuthMode
  onSuccess: (token: string) => void
  onSwitch: () => void
}

export function AuthPage({ mode, onSuccess, onSwitch }: AuthPageProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const body =
        mode === 'login'
          ? { username, password }
          : { username, email, password }

      const res = await fetch(`${API_URL}/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(mode === 'login' ? 'Invalid credentials' : 'Signup failed')
      const data = await res.json()
      onSuccess(data.JsonWebToken)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submit()
  }

  const isLogin = mode === 'login'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">{isLogin ? '🐾' : '🐱'}</div>
        <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to generate cats' : 'Join the cat gallery community'}
        </p>

        <div className="auth-fields">
          <label className="field-label">
            Username
            <input
              placeholder="your_username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
          </label>

          {!isLogin && (
            <label className="field-label">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
              />
            </label>
          )}

          <label className="field-label">
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
          </label>

          {error && <p className="field-error">{error}</p>}

          <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                {isLogin ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </button>
        </div>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className="link-btn" onClick={onSwitch}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
