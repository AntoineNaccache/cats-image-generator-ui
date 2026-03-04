import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Cat {
  id: string
  name: string
  age: number
  breed: string
  image_path?: string
  created_at: string
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [catName, setCatName] = useState('')
  const [catAge, setCatAge] = useState('')
  const [catBreed, setCatBreed] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'generate' | 'cats'>('generate')
  const [cats, setCats] = useState<Cat[]>([])
  const [catsLoading, setCatsLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setBackendStatus(data.status === 'ok' ? 'ok' : 'error'))
      .catch(() => setBackendStatus('error'))
  }, [])

  useEffect(() => {
    if (view === 'cats' && token) fetchCats()
  }, [view])

  async function fetchCats() {
    setCatsLoading(true)
    try {
      const res = await fetch(`${API_URL}/cats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setCats(await res.json())
    } catch {
      setCats([])
    } finally {
      setCatsLoading(false)
    }
  }

  async function login() {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      localStorage.setItem('token', data.JsonWebToken)
      setToken(data.JsonWebToken)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  async function generateImage() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/cats/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: catName || 'Whiskers',
          age: parseInt(catAge) || 2,
          breed: catBreed || 'Persian',
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const blob = await res.blob()
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      setImageUrl(URL.createObjectURL(blob))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setImageUrl(null)
  }

  if (!token) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h1>Cat Image Generator</h1>
          {!import.meta.env.PROD && <p className="api-url">API: {API_URL}</p>}
          <p className={`backend-status ${backendStatus}`}>
            {backendStatus === 'checking' ? '⬤ Connecting...' : backendStatus === 'ok' ? '⬤ Backend connected' : '⬤ Backend unreachable'}
          </p>
          <div className="card">
            <input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            <button onClick={login}>Login</button>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cat Image Generator</h1>
        <div className="header-right">
          {!import.meta.env.PROD && <span className="api-url">API: {API_URL}</span>}
          <span className={`backend-dot ${backendStatus}`} title={backendStatus === 'ok' ? 'Backend connected' : 'Backend unreachable'}>⬤</span>
          <button onClick={logout} className="logout">Logout</button>
        </div>
      </header>

      <nav className="tabs">
        <button className={view === 'generate' ? 'active' : ''} onClick={() => setView('generate')}>Generate</button>
        <button className={view === 'cats' ? 'active' : ''} onClick={() => setView('cats')}>All Cats</button>
      </nav>

      <main className="container">
        {view === 'generate' && (
          <>
            <div className="card">
              <input placeholder="Cat name" value={catName} onChange={e => setCatName(e.target.value)} />
              <input placeholder="Age" type="number" value={catAge} onChange={e => setCatAge(e.target.value)} />
              <input placeholder="Breed" value={catBreed} onChange={e => setCatBreed(e.target.value)} />
              <button onClick={generateImage} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Cat Image'}
              </button>
              {error && <p className="error">{error}</p>}
            </div>
            {imageUrl && <img src={imageUrl} alt="Generated cat" className="cat-image" />}
          </>
        )}

        {view === 'cats' && (
          <div className="cats-grid">
            {catsLoading && <p className="muted">Loading...</p>}
            {!catsLoading && cats.length === 0 && <p className="muted">No cats yet.</p>}
            {cats.map(cat => (
              <div key={cat.id} className="cat-card">
                {cat.image_path
                  ? <img src={cat.image_path} alt={cat.name} />
                  : <div className="cat-card-placeholder">No image</div>
                }
                <div className="cat-card-info">
                  <strong>{cat.name}</strong>
                  <span>{cat.breed} · {cat.age}y</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
