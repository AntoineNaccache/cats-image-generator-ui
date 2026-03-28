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
  likes_count?: number
}

export type View = 'gallery' | 'login' | 'generate'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [view, setView] = useState<View>('gallery')
  const [cats, setCats] = useState<Cat[]>([])
  const [catsLoading, setCatsLoading] = useState(false)
  const [likedCatIds, setLikedCatIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.access_token) fetchMyLikes(session.access_token)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        navigate('gallery')
        fetchMyLikes(session.access_token)
      } else {
        setLikedCatIds(new Set())
      }
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

  async function fetchMyLikes(token: string) {
    try {
      const res = await fetch(`${API_URL}/cats/my-likes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const ids: string[] = await res.json()
      setLikedCatIds(new Set(ids))
    } catch {
      // silently ignore
    }
  }

  async function handleLike(catId: string) {
    const token = session?.access_token
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/cats/${catId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const { liked, likes_count }: { liked: boolean; likes_count: number } = await res.json()
      setLikedCatIds(prev => {
        const next = new Set(prev)
        if (liked) next.add(catId)
        else next.delete(catId)
        return next
      })
      setCats(prev => prev.map(c => c.id === catId ? { ...c, likes_count } : c))
    } catch {
      // silently ignore
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
            likedCatIds={likedCatIds}
            onLike={handleLike}
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
