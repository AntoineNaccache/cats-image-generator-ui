import type { Cat, View } from '../App'

interface GalleryPageProps {
  cats: Cat[]
  loading: boolean
  token: string | null
  onNavigate: (v: View) => void
}

export function GalleryPage({ cats, loading, token, onNavigate }: GalleryPageProps) {
  return (
    <div className="gallery-page">
      <div className="hero">
        <div className="hero-badge">AI-Powered 🤖</div>
        <h1 className="hero-title">The Cat Gallery</h1>
        <p className="hero-subtitle">
          Unique cats conjured by artificial intelligence, one prompt at a time.
        </p>
        {!token && (
          <button className="btn btn-primary hero-cta" onClick={() => onNavigate('signup')}>
            Generate your cat →
          </button>
        )}
      </div>

      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-section-title">Community Cats</h2>
          {!loading && cats.length > 0 && (
            <span className="count-badge">{cats.length} cats</span>
          )}
        </div>

        {loading ? (
          <div className="masonry">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="cat-card">
                <div className="skeleton skeleton-img" />
              </div>
            ))}
          </div>
        ) : cats.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🐾</span>
            <p>No cats yet! Be the first to generate one.</p>
            {!token && (
              <button className="btn btn-primary" onClick={() => onNavigate('signup')}>
                Get started
              </button>
            )}
          </div>
        ) : (
          <div className="masonry">
            {cats.map(cat => (
              <div key={cat.id} className="cat-card">
                <div className="cat-img-wrapper">
                  {cat.image_path ? (
                    <img
                      src={cat.image_path}
                      alt={cat.name}
                      loading="lazy"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`cat-placeholder${cat.image_path ? ' hidden' : ''}`}>🐱</div>
                  <div className="cat-overlay">
                    <strong className="overlay-name">{cat.name}</strong>
                    <span className="overlay-meta">
                      {cat.breed} · {cat.age}y
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
