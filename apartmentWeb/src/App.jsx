import { useState, useEffect, useMemo } from 'react'
import './App.css'

function App() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterBeds, setFilterBeds] = useState('All');

  useEffect(() => {
    // Fetch data from our FastAPI backend!
    fetch('http://localhost:8000/api/apartments')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setApartments(data.data);
        } else {
          setError(data.message || 'Failed to fetch apartments');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to connect to backend server. Make sure it is running!');
        setLoading(false);
      });
  }, []);

  const companies = ['All', ...new Set(apartments.map(a => a.leasing_company).filter(Boolean))];
  const bedCountList = ['All', '0', '1', '2', '3', '4', '5+'];

  const filteredApartments = useMemo(() => {
    return apartments.filter(apt => {
      // Filter by company
      if (filterCompany !== 'All' && apt.leasing_company !== filterCompany) return false;
      
      // Filter by beds
      if (filterBeds !== 'All') {
        const b = String(apt.beds).toLowerCase();
        if (filterBeds === '5+' && parseInt(b) >= 5) return true;
        if (b !== filterBeds) return false;
      }
      return true;
    });
  }, [apartments, filterCompany, filterBeds]);

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">Campus Living</div>
        <div className="navbar-actions">
          <button className="icon-btn">🔍</button>
          <button className="icon-btn">❤️</button>
        </div>
      </nav>

      <div className="search-page">
        {/* Sidebar for Filters */}
        <aside className="search-sidebar">
          <h2 className="sidebar-heading">Filter Results</h2>
          
          <div className="sidebar-filter">
            <div className="sidebar-filter-label">Leasing Company</div>
            <select 
               className="sidebar-text-input"
               value={filterCompany} 
               onChange={e => setFilterCompany(e.target.value)}
            >
              {companies.map(c => <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>)}
            </select>
          </div>

          <div className="sidebar-filter">
            <div className="sidebar-filter-label">Bedrooms</div>
            <div className="sidebar-option-btns">
               {['All', '1', '2', '3', '4', '5+'].map(val => (
                 <button 
                   key={val}
                   className={`sidebar-opt-btn ${filterBeds === val ? 'selected' : ''}`}
                   onClick={() => setFilterBeds(val)}
                 >
                   {val === 'All' ? 'Any' : val}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="sidebar-actions">
             <button className="sidebar-search-btn" onClick={() => {}}>Apply Filters</button>
             <button className="sidebar-clear-btn" onClick={() => { setFilterCompany('All'); setFilterBeds('All'); }}>Clear All</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="results-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="results-header">
            <h2 className="results-title">Available Units</h2>
            <span className="results-count">{filteredApartments.length} properties found</span>
          </div>

          {error && <div className="error" style={{ color: 'red', padding: '1rem' }}>⚠️ {error}</div>}
          
          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <p>Loading properties...</p>
            </div>
          ) : (
            <>
              <div className="apartments-grid">
                {filteredApartments.slice(0, 100).map((apt, index) => (
                  <div 
                    className="apt-card" 
                    key={index}
                    style={{ animationDelay: `${(index % 20) * 0.05}s` }}
                    onClick={() => window.open(apt.url || apt.link, '_blank')}
                  >
                    <div className="apt-card-img">
                      <button className="apt-card-favorite" onClick={(e) => { e.stopPropagation(); }}>
                        ♡
                      </button>
                    </div>
                    
                    <div className="apt-card-body">
                      <div className="apt-card-name">{apt.address || 'Address Unavailable'}</div>
                      <div className="apt-card-mgmt">{apt.leasing_company || 'Unknown Company'}</div>
                      
                      <div className="apt-card-details" style={{ marginTop: '0.75rem' }}>
                        <span>🛏️ {apt.beds} Beds</span>
                        <span>🚿 {apt.baths} Baths</span>
                        <span>📏 {apt.sq_ft || 'N/A'} Sq Ft</span>
                      </div>
                      
                      <div className="apt-card-price">{apt.rent}</div>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && !error && filteredApartments.length === 0 && (
                <div className="no-results">
                  <h3>No matches found</h3>
                  <p>Try adjusting your filters to see more results.</p>
                </div>
              )}
              {!loading && !error && filteredApartments.length > 100 && (
                 <p style={{textAlign: 'center', marginTop: '2rem', color: '#888'}}>
                   Showing top 100 of {filteredApartments.length} results.
                 </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
