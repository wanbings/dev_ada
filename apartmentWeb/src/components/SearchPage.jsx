import { useState } from 'react'
import ApartmentCard from './ApartmentCard'
import rawData from '../data/smile_apartments.json'

// ─── Parse raw JSON into usable objects ──────────────────────────────────────
function parseBeds(str) {
  if (!str) return null
  if (str.toLowerCase() === 'studio') return 0
  const m = str.match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}
function parseBaths(str) {
  if (!str) return null
  const m = str.match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}
function parseRent(str) {
  if (!str || str === '-') return null
  const m = str.replace(/[$,]/g, '').match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}
function parseSqft(str) {
  if (!str || str === 'N/A') return null
  const m = str.replace(/,/g, '').match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}

// Deterministic pseudo-distances so each apartment always has the same values
function fakeDist(idx, salt) {
  return parseFloat((((idx * 7919 * salt) % 1000) / 1000 * 1.3 + 0.15).toFixed(2))
}

const APARTMENTS = rawData.map((item, idx) => ({
  id: idx,
  name: item.address,
  beds: parseBeds(item.beds),
  baths: parseBaths(item.baths),
  sqft: parseSqft(item['sq ft']),
  price: parseRent(item.rent),
  management: 'Smile Student Living',
  url: item.url,
  distEngQuad:   fakeDist(idx, 1),
  distUnion:     fakeDist(idx, 3),
  distSouthQuad: fakeDist(idx, 7),
  distARC:       fakeDist(idx, 11),
}))

// ─── Filter logic ─────────────────────────────────────────────────────────────
function applyFilters(apartments, f) {
  return apartments.filter(apt => {
    if (f.beds !== null) {
      const match = f.beds === 4 ? apt.beds >= 4 : apt.beds === f.beds
      if (!match) return false
    }
    if (f.baths !== null) {
      const match = f.baths === 3 ? apt.baths >= 3 : apt.baths === f.baths
      if (!match) return false
    }
    if (f.sqftMin !== '') {
      if (apt.sqft === null || apt.sqft < Number(f.sqftMin)) return false
    }
    if (f.sqftMax !== '') {
      if (apt.sqft === null || apt.sqft > Number(f.sqftMax)) return false
    }
    if (f.priceMin !== '') {
      if (apt.price === null || apt.price < Number(f.priceMin)) return false
    }
    if (f.priceMax !== '') {
      if (apt.price === null || apt.price > Number(f.priceMax)) return false
    }
    if (f.management !== '') {
      if (!apt.management.toLowerCase().includes(f.management.toLowerCase())) return false
    }
    if (f.distEngQuad   !== null && apt.distEngQuad   > f.distEngQuad)   return false
    if (f.distUnion     !== null && apt.distUnion     > f.distUnion)     return false
    if (f.distSouthQuad !== null && apt.distSouthQuad > f.distSouthQuad) return false
    if (f.distARC       !== null && apt.distARC       > f.distARC)       return false
    return true
  })
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DIST_OPTIONS = [
  { label: '< 0.25 mi  (~5 min)',  value: 0.25 },
  { label: '< 0.5 mi   (~10 min)', value: 0.5  },
  { label: '< 1 mi     (~20 min)', value: 1.0  },
]
const BED_OPTIONS  = [0, 1, 2, 3, 4]
const BATH_OPTIONS = [1, 2, 3]
const INITIAL_FILTERS = {
  beds: null, baths: null,
  sqftMin: '', sqftMax: '',
  priceMin: '', priceMax: '',
  management: '',
  distEngQuad: null, distUnion: null, distSouthQuad: null, distARC: null,
}
const DISTANCE_LOCATIONS = [
  { key: 'distEngQuad',   name: 'Eng. Quad'  },
  { key: 'distUnion',     name: 'Union'      },
  { key: 'distSouthQuad', name: 'South Quad' },
  { key: 'distARC',       name: 'ARC'        },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [results, setResults] = useState(null)

  function set(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  function toggleOpt(key, value) {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }))
  }
  function handleSearch() {
    setResults(applyFilters(APARTMENTS, filters))
  }
  function handleClear() {
    setFilters(INITIAL_FILTERS)
    setResults(null)
  }

  return (
    <div className="search-page">

      {/* ── Left Sidebar ── */}
      <aside className="search-sidebar">
        <div className="sidebar-heading">Filters</div>

        {/* Beds */}
        <div className="sidebar-filter">
          <div className="sidebar-filter-label">Bedrooms</div>
          <div className="sidebar-option-btns">
            {BED_OPTIONS.map(n => (
              <button
                key={n}
                className={`sidebar-opt-btn ${filters.beds === n ? 'selected' : ''}`}
                onClick={() => toggleOpt('beds', n)}
              >
                {n === 0 ? 'Studio' : n === 4 ? '4+' : n}
              </button>
            ))}
          </div>
        </div>

        {/* Baths */}
        <div className="sidebar-filter">
          <div className="sidebar-filter-label">Bathrooms</div>
          <div className="sidebar-option-btns">
            {BATH_OPTIONS.map(n => (
              <button
                key={n}
                className={`sidebar-opt-btn ${filters.baths === n ? 'selected' : ''}`}
                onClick={() => toggleOpt('baths', n)}
              >
                {n === 3 ? '3+' : n}
              </button>
            ))}
          </div>
        </div>

        {/* Sq Ft */}
        <div className="sidebar-filter">
          <div className="sidebar-filter-label">Sq Ft</div>
          <div className="sidebar-range-row">
            <input className="sidebar-range-input" type="number" placeholder="Min"
              value={filters.sqftMin} onChange={e => set('sqftMin', e.target.value)} />
            <span className="sidebar-range-sep">–</span>
            <input className="sidebar-range-input" type="number" placeholder="Max"
              value={filters.sqftMax} onChange={e => set('sqftMax', e.target.value)} />
          </div>
        </div>

        {/* Price */}
        <div className="sidebar-filter">
          <div className="sidebar-filter-label">Monthly Rent ($)</div>
          <div className="sidebar-range-row">
            <input className="sidebar-range-input" type="number" placeholder="Min"
              value={filters.priceMin} onChange={e => set('priceMin', e.target.value)} />
            <span className="sidebar-range-sep">–</span>
            <input className="sidebar-range-input" type="number" placeholder="Max"
              value={filters.priceMax} onChange={e => set('priceMax', e.target.value)} />
          </div>
        </div>

        {/* Management */}
        <div className="sidebar-filter">
          <div className="sidebar-filter-label">Management</div>
          <input className="sidebar-text-input" type="text" placeholder="e.g. Smile..."
            value={filters.management} onChange={e => set('management', e.target.value)} />
        </div>

        {/* Distance — 3 columns */}
        <div className="sidebar-filter">
          <div className="sidebar-filter-label">Distance from Campus</div>
          <div className="sidebar-dist-grid">
            {DISTANCE_LOCATIONS.map(({ key, name }) => (
              <div key={key} className="sidebar-dist-col">
                <div className="sidebar-dist-col-name">{name}</div>
                {DIST_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`sidebar-dist-opt ${filters[key] === opt.value ? 'selected' : ''}`}
                    onClick={() => toggleOpt(key, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="sidebar-actions">
          <button className="sidebar-search-btn" onClick={handleSearch}>Search</button>
          <button className="sidebar-clear-btn" onClick={handleClear}>Clear all filters</button>
        </div>
      </aside>

      {/* ── Results Area ── */}
      <div className="search-results">
        {results === null ? (
          <div className="search-empty-state">
            <div className="search-empty-state-icon">🏠</div>
            <h3>Set your filters and search</h3>
            <p>Use the panel on the left to filter by beds, baths, price, size, and distance from campus.</p>
          </div>
        ) : (
          <>
            <div className="search-results-header">
              <span className="search-results-title">Results</span>
              <span className="search-results-count">
                {results.length} apartment{results.length !== 1 ? 's' : ''} found
              </span>
            </div>
            {results.length === 0 ? (
              <div className="search-no-results">
                <strong>No apartments match your filters.</strong>
                <p>Try adjusting or clearing some filters.</p>
              </div>
            ) : (
              <div className="search-results-grid">
                {results.map(apt => (
                  <ApartmentCard key={apt.id} apartment={apt} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}
