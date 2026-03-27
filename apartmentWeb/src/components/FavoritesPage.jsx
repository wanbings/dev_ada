import { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import './FavoritesPage.css';

function FavoritesPage() {
  const { getFavoritesList, toggleFavorite, addNote } = useFavorites();
  const favoritesList = getFavoritesList();
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  const handleStartEdit = (address, currentNote) => {
    setEditingNote(address);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = (address) => {
    addNote(address, noteText);
    setEditingNote(null);
    setNoteText('');
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteText('');
  };

  if (favoritesList.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <h2>No Favorites Yet</h2>
          <p>Start adding apartments to your favorites by clicking the ❤️ icon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">My Favorites</h1>
      <div className="favorites-grid">
        {favoritesList.map(({ apartment, note }) => (
          <div key={apartment.address} className="favorite-card">
            <div className="favorite-header">
              <h3 className="favorite-address">{apartment.address}</h3>
              <button
                className="favorite-remove-btn"
                onClick={() => toggleFavorite(apartment)}
                title="Remove from favorites"
              >
                ❤️
              </button>
            </div>

            <div className="favorite-details">
              <div className="detail-item">
                <span className="detail-label">Rent:</span>
                <span className="detail-value">{apartment.rent}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Beds:</span>
                <span className="detail-value">{apartment.beds}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Baths:</span>
                <span className="detail-value">{apartment.baths}</span>
              </div>
              {apartment['sq ft'] && (
                <div className="detail-item">
                  <span className="detail-label">Sq Ft:</span>
                  <span className="detail-value">{apartment['sq ft']}</span>
                </div>
              )}
            </div>

            <div className="favorite-notes-section">
              <div className="notes-header">
                <span className="notes-label">Notes:</span>
                {editingNote !== apartment.address && (
                  <button
                    className="notes-edit-btn"
                    onClick={() => handleStartEdit(apartment.address, note)}
                  >
                    {note ? 'Edit' : 'Add Note'}
                  </button>
                )}
              </div>

              {editingNote === apartment.address ? (
                <div className="notes-edit">
                  <textarea
                    className="notes-textarea"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your notes here..."
                    rows="4"
                  />
                  <div className="notes-actions">
                    <button
                      className="notes-save-btn"
                      onClick={() => handleSaveNote(apartment.address)}
                    >
                      Save
                    </button>
                    <button
                      className="notes-cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="notes-display">
                  {note || 'No notes yet'}
                </p>
              )}
            </div>

            {apartment.url && (
              <a
                href={apartment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="favorite-view-link"
              >
                View Listing
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoritesPage;
