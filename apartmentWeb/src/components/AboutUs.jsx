export default function AboutUs() {
  return (
    <div className="about-page">

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
