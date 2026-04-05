export default function AboutUs() {
  return (
    <div className="about-page">

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

      {/* ── About Us / Founders ── */}
      <div className="about-section-dark">
      <section className="about-section">
        <h2 className="about-section-title light">Meet the Team</h2>
        <p className="about-section-sub light">
          We're a group of UIUC students who know firsthand how stressful apartment
          hunting can be. We built this platform to make the process faster, clearer,
          and actually enjoyable.
        </p>

        <div className="founders-grid">

          <div className="founder-card">
            <div className="founder-avatar">👤</div>
            <div className="founder-name">Founder Name</div>
            <div className="founder-role">Co-Founder</div>
          </div>

          <div className="founder-card">
            <div className="founder-avatar">👤</div>
            <div className="founder-name">Founder Name</div>
            <div className="founder-role">Co-Founder</div>
          </div>

          <div className="founder-card">
            <div className="founder-avatar">👤</div>
            <div className="founder-name">Founder Name</div>
            <div className="founder-role">Co-Founder</div>
          </div>

        </div>
      </section>
      </div>

    </div>
  )
}
