import { useState, useEffect, useMemo } from 'react'
import './App.css'

function App() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterBeds, setFilterBeds] = useState('All');
  const [filterBaths, setFilterBaths] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 60;

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
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const addressMatch = apt.address && apt.address.toLowerCase().includes(query);
        const companyMatch = apt.leasing_company && apt.leasing_company.toLowerCase().includes(query);
        if (!addressMatch && !companyMatch) return false;
      }

      // Filter by company
      if (filterCompany !== 'All' && apt.leasing_company !== filterCompany) return false;
      
      // Filter by beds
      if (filterBeds !== 'All') {
        const bText = String(apt.beds).toLowerCase();
        const bNum = parseInt(bText);
        
        if (filterBeds === 'Studio') {
          if (!bText.includes('studio') && (!(!isNaN(bNum) && bNum === 0))) {
            return false;
          }
        } else if (filterBeds === '5+' && !isNaN(bNum) && bNum >= 5) {
          // match
        } else if (!isNaN(bNum) && bNum.toString() === filterBeds) {
          // match
        } else if (bText === filterBeds.toLowerCase()) {
          // fallback string match
        } else {
          return false;
        }
      }

      // Filter by baths
      if (filterBaths !== 'All') {
        const bText = String(apt.baths).toLowerCase();
        const bNum = parseInt(bText);
        if (filterBaths === '4+' && !isNaN(bNum) && bNum >= 4) {
          // match
        } else if (!isNaN(bNum) && bNum.toString() === filterBaths) {
          // match
        } else if (bText === filterBaths) {
          // fallback string match
        } else {
          return false;
        }
      }
      return true;
    });
  }, [apartments, searchQuery, filterCompany, filterBeds, filterBaths]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCompany, filterBeds, filterBaths]);

  const totalPages = Math.ceil(filteredApartments.length / ITEMS_PER_PAGE);
  const paginatedApartments = filteredApartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">Quad Keys</div>
        <div style={{ flex: 1 }}></div>
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSearchExpanded || searchQuery ? (
            <input 
              type="text" 
              className="sidebar-text-input"
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
              style={{ width: '240px' }}
            />
          ) : (
            <button className="icon-btn" onClick={() => setIsSearchExpanded(true)}>🔍</button>
          )}
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
               {['All', 'Studio', '1', '2', '3', '4', '5+'].map(val => (
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

          <div className="sidebar-filter">
            <div className="sidebar-filter-label">Bathrooms</div>
            <div className="sidebar-option-btns">
               {['All', '1', '2', '3', '4+'].map(val => (
                 <button 
                   key={val}
                   className={`sidebar-opt-btn ${filterBaths === val ? 'selected' : ''}`}
                   onClick={() => setFilterBaths(val)}
                 >
                   {val === 'All' ? 'Any' : val}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="sidebar-actions">
             <button className="sidebar-search-btn" onClick={() => {}}>Apply Filters</button>
             <button className="sidebar-clear-btn" onClick={() => { setSearchQuery(''); setFilterCompany('All'); setFilterBeds('All'); setFilterBaths('All'); }}>Clear All</button>
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
                {paginatedApartments.map((apt, index) => (
                  <div 
                    className="apt-card" 
                    key={index}
                    style={{ animationDelay: `${(index % 20) * 0.05}s` }}
                    onClick={() => window.open(apt.url || apt.link, '_blank')}
                  >
                    <div className={`apt-card-img ${!apt.image ? 'placeholder' : ''}`} style={apt.image ? { backgroundImage: `url(${apt.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
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
              {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        document.querySelector('.results-section').scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: '8px', opacity: currentPage === 1 ? 0.3 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Page {currentPage} of {totalPages} ({filteredApartments.length} found)
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        document.querySelector('.results-section').scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: '8px', opacity: currentPage === totalPages ? 0.3 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
