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
          <div className="container">
            {!import.meta.env.PROD && <p className="api-url">API: {API_URL}</p>}
            <h2 className="section-title">All Cats</h2>
            {catsLoading && <p className="muted">Loading...</p>}
            {!catsLoading && cats.length === 0 && <p className="muted">No cats yet.</p>}
            <div className="cats-grid">
              {cats.map(cat => (
                <div key={cat.id} className="cat-card">
                  {cat.image_path
                    ? <img src={cat.image_path} alt={cat.name} />
                    : <div className="cat-card-placeholder">No image</div>
                  }
                  <div className="cat-card-info">
                    <strong>{cat.name}</strong>
                    <span>{cat.breed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="auth-screen">
            <div className="auth-box">
              <h2>Login</h2>
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
            <h2 className="section-title">Generate a Cat</h2>
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
          </div>
        )}
      </main>
    </div>
  )
}

export default App
