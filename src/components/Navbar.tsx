import type { View } from '../App'

interface NavbarProps {
  token: string | null
  currentView: View
  onNavigate: (v: View) => void
  onLogout: () => void
}

export function Navbar({ token, currentView, onNavigate, onLogout }: NavbarProps) {
  return (
    <header className="navbar">
      <button className="logo-btn" onClick={() => onNavigate('gallery')}>
        <span className="logo-icon">🐱</span>
        <span className="logo-text">CatGen</span>
        <span className="logo-sparkle">✨</span>
      </button>

      <nav className="nav-links">
        <button
          className={`nav-link ${currentView === 'gallery' ? 'active' : ''}`}
          onClick={() => onNavigate('gallery')}
        >
          Gallery
        </button>
        {token && (
          <button
            className={`nav-link ${currentView === 'generate' ? 'active' : ''}`}
            onClick={() => onNavigate('generate')}
          >
            Generate
          </button>
        )}
      </nav>

      <div className="nav-actions">
        {token ? (
          <button className="btn btn-outline" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => onNavigate('login')}>
              Login
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate('signup')}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  )
}
