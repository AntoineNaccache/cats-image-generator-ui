import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [catName, setCatName] = useState('')
  const [catAge, setCatAge] = useState('')
  const [catBreed, setCatBreed] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <div className="container">
        <h1>Cat Image Generator</h1>
        {!import.meta.env.PROD && <p className="api-url">API: {API_URL}</p>}
        <div className="card">
          <h2>Login</h2>
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
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Cat Image Generator</h1>
        <button onClick={logout} className="logout">Logout</button>
      </div>
      {!import.meta.env.PROD && <p className="api-url">API: {API_URL}</p>}
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
  )
}

export default App
