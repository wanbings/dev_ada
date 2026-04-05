export default function HomePage({ onNavigate }) {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <h1 className="about-hero-title">Finding Your Home Near UIUC</h1>
          <p className="about-hero-sub">
            The easiest way to search, filter, and compare apartments near campus —
            built by Illini, for Illini.
          </p>
          <button className="about-cta-btn" onClick={() => onNavigate('search')}>
            Find Your Apartment →
          </button>
        </div>
      </section>

    </div>
  )
}
