import { useState, useEffect } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import { GalleryPage } from './components/GalleryPage'
import { GeneratePage } from './components/GeneratePage'
import { AuthPage } from './components/AuthPage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Cat {
  id: string
  name: string
  age: number
  breed: string
  image_path?: string
  created_at: string
}

export type View = 'gallery' | 'login' | 'signup' | 'generate'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [view, setView] = useState<View>('gallery')
  const [cats, setCats] = useState<Cat[]>([])
  const [catsLoading, setCatsLoading] = useState(false)

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
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAuthSuccess(jwt: string) {
    localStorage.setItem('token', jwt)
    setToken(jwt)
    navigate('gallery')
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    navigate('gallery')
  }

  return (
    <div className="app">
      <Navbar
        token={token}
        currentView={view}
        onNavigate={navigate}
        onLogout={logout}
      />

      <main className="main">
        {view === 'gallery' && (
          <GalleryPage
            cats={cats}
            loading={catsLoading}
            token={token}
            onNavigate={navigate}
          />
        )}

        {view === 'login' && (
          <AuthPage
            mode="login"
            onSuccess={handleAuthSuccess}
            onSwitch={() => navigate('signup')}
          />
        )}

        {view === 'signup' && (
          <AuthPage
            mode="signup"
            onSuccess={handleAuthSuccess}
            onSwitch={() => navigate('login')}
          />
        )}

        {view === 'generate' && token && (
          <GeneratePage token={token} onGenerated={fetchCats} />
        )}
      </main>
    </div>
  )
}

export default App
