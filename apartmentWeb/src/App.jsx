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
    <div className="app-container">
      <header>
        <h1>Campus Living</h1>
        <p className="subtitle">Find your perfect apartment unit near campus</p>
      </header>

      {error && <div className="error">⚠️ {error}</div>}
      
      {loading ? (
        <div className="loading">
          <p>Loading properties...</p>
        </div>
      ) : (
        <>
          {!error && (
             <div className="filters">
               <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                 {companies.map(c => <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>)}
               </select>

               <select value={filterBeds} onChange={e => setFilterBeds(e.target.value)}>
                 <option value="All">Any Beds</option>
                 <option value="1">1 Bed</option>
                 <option value="2">2 Beds</option>
                 <option value="3">3 Beds</option>
                 <option value="4">4 Beds</option>
                 <option value="5+">5+ Beds</option>
               </select>
             </div>
          )}

          <div className="apartments-grid">
            {filteredApartments.slice(0, 100).map((apt, index) => (
              <div 
                className="apartment-card" 
                key={index}
                style={{ animationDelay: `${(index % 20) * 0.05}s` }}
              >
                <div className="leasing-company">{apt.leasing_company || 'Unknown Company'}</div>
                <div className="address">{apt.address || 'Address Unavailable'}</div>
                
                <div className="details">
                  <div className="detail-item">
                    <span className="detail-label">BEDS</span>
                    <span className="detail-value">{apt.beds}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">BATHS</span>
                    <span className="detail-value">{apt.baths}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">RENT</span>
                    <span className="detail-value rent-value">{apt.rent}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">SQ FT</span>
                    <span className="detail-value">{apt.sq_ft || 'N/A'}</span>
                  </div>
                </div>

                <a 
                   href={apt.url || apt.link} 
                   target="_blank" 
                   rel="noreferrer"
                   className="view-btn"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>

          {!loading && !error && filteredApartments.length === 0 && (
            <div className="loading">No apartments match your filters.</div>
          )}
          {!loading && !error && filteredApartments.length > 100 && (
             <p style={{textAlign: 'center', marginTop: '2rem', color: '#cbd5e1'}}>
               Showing top 100 of {filteredApartments.length} results.
             </p>
          )}
        </>
      )}
    </div>
  )
}

export default App
