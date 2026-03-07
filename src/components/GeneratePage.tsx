import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface GeneratePageProps {
  token: string
  onGenerated: () => void
}

export function GeneratePage({ token, onGenerated }: GeneratePageProps) {
  const [catName, setCatName] = useState('')
  const [catAge, setCatAge] = useState('')
  const [catBreed, setCatBreed] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
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
      if (!res.ok) {
        const messages: Record<number, string> = {
          401: 'Session expired — please log in again.',
          403: 'You do not have permission to generate cats.',
          429: 'Rate limit reached. Please wait a minute and try again.',
        }
        throw new Error(messages[res.status] ?? `Generation failed (${res.status})`)
      }
      const blob = await res.blob()
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      setImageUrl(URL.createObjectURL(blob))
      onGenerated()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="generate-page">
      <div className="generate-header">
        <h1 className="generate-title">Generate a Cat</h1>
        <p className="generate-subtitle">
          Describe your cat and let AI bring it to life.
        </p>
      </div>

      <div className="generate-layout">
        <div className="generate-form card">
          <label className="field-label">
            Name
            <input
              placeholder="e.g. Whiskers"
              value={catName}
              onChange={e => setCatName(e.target.value)}
            />
          </label>
          <label className="field-label">
            Age
            <input
              placeholder="e.g. 2"
              type="number"
              min="0"
              value={catAge}
              onChange={e => setCatAge(e.target.value)}
            />
          </label>
          <label className="field-label">
            Breed
            <input
              placeholder="e.g. Persian"
              value={catBreed}
              onChange={e => setCatBreed(e.target.value)}
            />
          </label>

          <button className="btn btn-primary btn-lg" onClick={generate} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Generating…
              </span>
            ) : (
              '🐱 Generate Cat'
            )}
          </button>

          {error && <p className="field-error">{error}</p>}
        </div>

        <div className="generate-preview">
          {imageUrl ? (
            <div className="preview-result">
              <img src={imageUrl} alt="Generated cat" className="preview-img" />
              <p className="preview-hint">
                ✅ Added to the gallery! Generate another?
              </p>
            </div>
          ) : (
            <div className="preview-placeholder">
              {loading ? (
                <>
                  <div className="cat-loading-anim">🐱</div>
                  <p>Conjuring your cat…</p>
                </>
              ) : (
                <>
                  <span className="preview-big-emoji">🐾</span>
                  <p>Your cat will appear here</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
