import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
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

export type View = 'gallery' | 'login' | 'generate'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [view, setView] = useState<View>('gallery')
  const [cats, setCats] = useState<Cat[]>([])
  const [catsLoading, setCatsLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) navigate('gallery')
    })

    fetchCats()
    return () => subscription.unsubscribe()
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

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
    navigate('gallery')
  }

  const token = session?.access_token ?? null

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
          <AuthPage />
        )}

        {view === 'generate' && token && (
          <GeneratePage token={token} onGenerated={fetchCats} />
        )}
      </main>
    </div>
  )
}

export default App
