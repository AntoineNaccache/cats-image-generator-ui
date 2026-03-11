import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface GeneratePageProps {
  token: string
  onGenerated: () => void
}

interface GeneratedCat {
  catId: string
  imageUrl: string
  breed: string
  age: number
}

type Phase = 'idle' | 'generating' | 'naming' | 'saving' | 'done'
type Mode = 'renaissance' | 'fruit'

export function GeneratePage({ token, onGenerated }: GeneratePageProps) {
  const [mode, setMode] = useState<Mode>('renaissance')
  const [phase, setPhase] = useState<Phase>('idle')
  const [generatedCat, setGeneratedCat] = useState<GeneratedCat | null>(null)
  const [fruitImageUrl, setFruitImageUrl] = useState<string | null>(null)
  const [catName, setCatName] = useState('')
  const [fruitForm, setFruitForm] = useState({ name: '', age: '', breed: '' })
  const [finalName, setFinalName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function generateRenaissance() {
    setPhase('generating')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/cats/generate/renaissance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const messages: Record<number, string> = {
          401: 'Session expired — please log in again.',
          403: 'You do not have permission to generate cats.',
          429: 'Daily limit reached. You can generate one image per day.',
        }
        throw new Error(messages[res.status] ?? `Generation failed (${res.status})`)
      }
      const data: GeneratedCat = await res.json()
      setGeneratedCat(data)
      setPhase('naming')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
      setPhase('idle')
    }
  }

  async function generateFruit() {
    const age = parseInt(fruitForm.age)
    if (!fruitForm.name.trim() || !fruitForm.breed.trim() || isNaN(age) || age < 0) {
      setError('Please fill in all fields with valid values.')
      return
    }
    setPhase('generating')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/cats/generate/fruit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: fruitForm.name.trim(), age, breed: fruitForm.breed.trim() }),
      })
      if (!res.ok) {
        const messages: Record<number, string> = {
          401: 'Session expired — please log in again.',
          403: 'Admin access required to generate fruit cats.',
          429: 'Too many requests. Please wait a moment.',
        }
        throw new Error(messages[res.status] ?? `Generation failed (${res.status})`)
      }
      const blob = await res.blob()
      if (fruitImageUrl) URL.revokeObjectURL(fruitImageUrl)
      setFruitImageUrl(URL.createObjectURL(blob))
      setFinalName(fruitForm.name.trim())
      setPhase('done')
      onGenerated()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
      setPhase('idle')
    }
  }

  async function saveName() {
    if (!generatedCat) return
    setPhase('saving')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/cats/${generatedCat.catId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: catName.trim() }),
      })
      if (!res.ok) throw new Error(`Failed to save name (${res.status})`)
      const saved = await res.json()
      setFinalName(saved.name || catName.trim())
      setPhase('done')
      onGenerated()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save name')
      setPhase('naming')
    }
  }

  function generateAnother() {
    setPhase('idle')
    setGeneratedCat(null)
    setCatName('')
    setFruitForm({ name: '', age: '', breed: '' })
    setFinalName('')
    setError(null)
    if (fruitImageUrl) {
      URL.revokeObjectURL(fruitImageUrl)
      setFruitImageUrl(null)
    }
  }

  const isIdle = phase === 'idle'
  const previewImageUrl = mode === 'fruit' ? fruitImageUrl : generatedCat?.imageUrl

  return (
    <div className="generate-page">
      <div className="generate-header">
        <h1 className="generate-title">Generate a Cat</h1>
        <p className="generate-subtitle">
          {phase === 'idle' && mode === 'renaissance' && 'Let AI paint your cat as a Renaissance portrait.'}
          {phase === 'idle' && mode === 'fruit' && 'Let AI create a fruity cat (admin only).'}
          {phase === 'generating' && mode === 'renaissance' && 'Consulting the Renaissance masters…'}
          {phase === 'generating' && mode === 'fruit' && 'Conjuring the fruit cat…'}
          {(phase === 'naming' || phase === 'saving') && 'Your portrait is ready! Name your cat, or leave it empty for a surprise.'}
          {phase === 'done' && `"${finalName}" has been added to the gallery!`}
        </p>
      </div>

      <div className="generate-layout">
        <div className="generate-form card">
          {isIdle && (
            <div className="mode-toggle">
              <button
                className={`btn ${mode === 'renaissance' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setMode('renaissance'); setError(null) }}
              >
                🎨 Renaissance
              </button>
              <button
                className={`btn ${mode === 'fruit' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setMode('fruit'); setError(null) }}
              >
                🍉 Fruit Cat
              </button>
            </div>
          )}

          {isIdle && mode === 'renaissance' && (
            <button className="btn btn-primary btn-lg" onClick={generateRenaissance}>
              🎨 Generate Cat
            </button>
          )}

          {isIdle && mode === 'fruit' && (
            <>
              <label className="field-label">
                Name
                <input
                  placeholder="e.g. Mango"
                  value={fruitForm.name}
                  onChange={e => setFruitForm(f => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="field-label">
                Age
                <input
                  type="number"
                  placeholder="e.g. 3"
                  min={0}
                  value={fruitForm.age}
                  onChange={e => setFruitForm(f => ({ ...f, age: e.target.value }))}
                />
              </label>
              <label className="field-label">
                Breed
                <input
                  placeholder="e.g. Persian"
                  value={fruitForm.breed}
                  onChange={e => setFruitForm(f => ({ ...f, breed: e.target.value }))}
                />
              </label>
              <button className="btn btn-primary btn-lg" onClick={generateFruit}>
                🍉 Generate Fruit Cat
              </button>
            </>
          )}

          {phase === 'generating' && (
            <div className="btn-loading">
              <span className="spinner" />
              <span>{mode === 'renaissance' ? 'Painting your Renaissance portrait…' : 'Conjuring the fruit cat…'}</span>
            </div>
          )}

          {(phase === 'naming' || phase === 'saving') && (
            <>
              <label className="field-label">
                Name your cat
                <input
                  placeholder="Leave empty for a surprise name!"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                />
              </label>
              {generatedCat && (
                <p className="field-hint">
                  A {generatedCat.age}-year-old {generatedCat.breed}
                </p>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={saveName}
                disabled={phase === 'saving'}
              >
                {phase === 'saving' ? (
                  <span className="btn-loading"><span className="spinner" /> Saving…</span>
                ) : catName.trim() ? '✅ Name my cat' : '🎲 Surprise me!'}
              </button>
            </>
          )}

          {phase === 'done' && (
            <button className="btn btn-primary btn-lg" onClick={generateAnother}>
              🎨 Generate another
            </button>
          )}

          {error && <p className="field-error">{error}</p>}
        </div>

        <div className="generate-preview">
          {previewImageUrl ? (
            <div className="preview-result">
              <img src={previewImageUrl} alt="Generated cat" className="preview-img" />
              {phase === 'done' && (
                <p className="preview-hint">✅ Added to the gallery as "{finalName}"!</p>
              )}
            </div>
          ) : (
            <div className="preview-placeholder">
              {phase === 'generating' ? (
                <>
                  <div className="cat-loading-anim">🖼️</div>
                  <p>{mode === 'renaissance' ? 'Consulting the Renaissance masters…' : 'Conjuring the fruit cat…'}</p>
                </>
              ) : (
                <>
                  <span className="preview-big-emoji">{mode === 'fruit' ? '🍉' : '🎨'}</span>
                  <p>{mode === 'fruit' ? 'Your fruit cat will appear here' : 'Your Renaissance portrait will appear here'}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
