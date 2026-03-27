import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export function FavoritesProvider({ children }) {
  // favorites structure: { address: { apartment: {...}, note: '' } }
  const [favorites, setFavorites] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // TODO: Your teammate should sync favorites to Firebase here
    // Example: await updateDoc(doc(db, 'users', userId), { favorites });
  }, [favorites]);

  const toggleFavorite = (apartment) => {
    setFavorites((prev) => {
      const newFavorites = { ...prev };
      if (newFavorites[apartment.address]) {
        // Remove from favorites
        delete newFavorites[apartment.address];
      } else {
        // Add to favorites
        newFavorites[apartment.address] = {
          apartment,
          note: ''
        };
      }
      return newFavorites;
    });
  };

  const isFavorite = (address) => {
    return !!favorites[address];
  };

  const addNote = (address, note) => {
    setFavorites((prev) => {
      if (!prev[address]) return prev;
      return {
        ...prev,
        [address]: {
          ...prev[address],
          note
        }
      };
    });
  };

  const getFavoritesList = () => {
    return Object.values(favorites);
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    addNote,
    getFavoritesList
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
