export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">UIUC Apartments</div>

      <div className="navbar-links">
        <button
          className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          className={`nav-btn ${currentPage === 'search' ? 'active' : ''}`}
          onClick={() => onNavigate('search')}
        >
          Find Your Apartment
        </button>
        <button className="nav-btn">Other</button>
      </div>

      <div className="navbar-actions">
        <button
          className="icon-btn"
          title="Favorites"
          onClick={() => onNavigate('favorites')}
        >
          ❤️
        </button>
        <button
          className="icon-btn"
          title="Account"
          onClick={() => onNavigate('auth')}
        >
          👤
        </button>
      </div>
    </nav>
  )
}
