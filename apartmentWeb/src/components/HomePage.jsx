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

      {/* ── How It Works ── */}
      <section className="about-section">
        <h2 className="about-section-title">How It Works</h2>
        <div className="steps-grid">

          <div className="step-card">
            <div className="step-icon">🔍</div>
            <h3 className="step-title">1. Set Your Filters</h3>
            <p className="step-desc">
              Filter by beds, baths, price, square footage, and management company.
              Then narrow by walking distance from the Main Quad, South Quad, or the ARC.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">🏠</div>
            <h3 className="step-title">2. Browse Listings</h3>
            <p className="step-desc">
              Matching apartments appear instantly. Every listing shows the details
              you actually care about — no fluff, no hidden fees.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">✅</div>
            <h3 className="step-title">3. Find Your Home</h3>
            <p className="step-desc">
              Compare your options side by side and land on the apartment that fits
              your lifestyle and budget — all in one place.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
