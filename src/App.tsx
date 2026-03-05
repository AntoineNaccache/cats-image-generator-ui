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

type View = 'gallery' | 'login' | 'signup' | 'generate'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [view, setView] = useState<View>('gallery')
  const [cats, setCats] = useState<Cat[]>([])
  const [catsLoading, setCatsLoading] = useState(false)

  // Login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Signup
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Generate
  const [catName, setCatName] = useState('')
  const [catAge, setCatAge] = useState('')
  const [catBreed, setCatBreed] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchCats()
  }, [])

  async function fetchCats() {
    setCatsLoading(true)
    try {
      const res = await fetch(`${API_URL}/cats`)
      if (!res.ok) throw new Error()
      setCats(await res.json())
    } catch {
      setCats([])
    } finally {
      setCatsLoading(false)
    }
  }

  function navigate(v: View) {
    setError(null)
    setSuccess(null)
    setView(v)
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
      navigate('gallery')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  async function signup() {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword }),
      })
      if (!res.ok) throw new Error('Signup failed')
      const data = await res.json()
      localStorage.setItem('token', data.JsonWebToken)
      setToken(data.JsonWebToken)
      navigate('gallery')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed')
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
      fetchCats()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    navigate('gallery')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo" onClick={() => navigate('gallery')}>Cat Image Generator</h1>
        <nav>
          {token ? (
            <>
              <button className="nav-btn" onClick={() => navigate('generate')}>Generate</button>
              <button className="nav-btn outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-btn outline" onClick={() => navigate('login')}>Login</button>
              <button className="nav-btn" onClick={() => navigate('signup')}>Sign Up</button>
            </>
          )}
        </nav>
      </header>

      <main>
        {view === 'gallery' && (
          <div>
            <div className="hero">
              <h2 className="hero-title">AI-Generated Cats</h2>
              <p className="hero-subtitle">A collection of unique cats conjured by artificial intelligence.</p>
            </div>
            <div className="container" style={{ paddingTop: 0 }}>
              {!import.meta.env.PROD && <p className="api-url">API: {API_URL}</p>}
              <div className="section-header">
                <span className="section-title">All Cats</span>
                {!catsLoading && cats.length > 0 && (
                  <span className="cats-count">{cats.length}</span>
                )}
              </div>
              {catsLoading ? (
                <div className="cats-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="cat-card">
                      <div className="skeleton-img skeleton" />
                      <div className="cat-card-info">
                        <div className="skeleton-line skeleton" />
                        <div className="skeleton-line short skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cats.length === 0 ? (
                <div className="empty-state">
                  <span className="big-emoji">🐱</span>
                  <p>No cats yet. Log in and generate the first one!</p>
                  {!token && (
                    <button onClick={() => navigate('signup')}>Get started</button>
                  )}
                </div>
              ) : (
                <div className="cats-grid">
                  {cats.map(cat => (
                    <div key={cat.id} className="cat-card">
                      <div className="cat-card-img-wrapper">
                        {cat.image_path
                          ? <img src={cat.image_path} alt={cat.name} />
                          : <div className="cat-card-placeholder">🐱</div>
                        }
                      </div>
                      <div className="cat-card-info">
                        <strong>{cat.name}</strong>
                        <span>{cat.breed} · {cat.age}y</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="auth-screen">
            <div className="auth-box">
              <div className="auth-icon">🐾</div>
              <h2>Welcome back</h2>
              <div className="card">
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
                <button onClick={login}>Login</button>
                {error && <p className="error">{error}</p>}
              </div>
              <p className="auth-switch">Don't have an account? <span onClick={() => navigate('signup')}>Sign up</span></p>
            </div>
          </div>
        )}

        {view === 'signup' && (
          <div className="auth-screen">
            <div className="auth-box">
              <div className="auth-icon">🐱</div>
              <h2>Create account</h2>
              <div className="card">
                <input placeholder="Username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
                <input placeholder="Email" type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && signup()} />
                <button onClick={signup}>Create account</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
              </div>
              <p className="auth-switch">Already have an account? <span onClick={() => navigate('login')}>Login</span></p>
            </div>
          </div>
        )}

        {view === 'generate' && (
          <div className="container">
            <div className="section-header" style={{ marginBottom: 24 }}>
              <span className="section-title">Generate a Cat</span>
            </div>
            <div className="generate-layout">
              <div className="card">
                <input placeholder="Name (e.g. Whiskers)" value={catName} onChange={e => setCatName(e.target.value)} />
                <input placeholder="Age (e.g. 2)" type="number" value={catAge} onChange={e => setCatAge(e.target.value)} />
                <input placeholder="Breed (e.g. Persian)" value={catBreed} onChange={e => setCatBreed(e.target.value)} />
                <button onClick={generateImage} disabled={loading}>
                  {loading ? 'Generating…' : 'Generate Cat Image'}
                </button>
                {error && <p className="error">{error}</p>}
              </div>
              <div>
                {imageUrl ? (
                  <img src={imageUrl} alt="Generated cat" className="cat-image" />
                ) : (
                  <div className="cat-image-placeholder">
                    <span className="big-emoji">🐾</span>
                    <span>Your cat will appear here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
