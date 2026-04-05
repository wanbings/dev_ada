import { useFavorites } from '../context/FavoritesContext'

export default function ApartmentCard({ apartment }) {
  const { name, beds, baths, sqft, price, management, url, image } = apartment
  const { toggleFavorite, isFavorite } = useFavorites()

  const bedLabel  = beds === null ? 'Beds Unavailable' : beds === 0 ? 'Studio' : `${beds} bed${beds !== 1 ? 's' : ''}`
  const bathLabel = baths !== null ? `${baths} bath${baths !== 1 ? 's' : ''}` : 'Baths Unavailable'
  const sqftLabel = sqft  !== null ? `${sqft.toLocaleString()} sqft` : 'Sq Ft Unavailable'
  const priceStr  = price !== null ? `$${price.toLocaleString()}/mo` : 'Contact for price'

  // Use name as unique identifier (or address if available)
  const identifier = apartment.address || name
  const isFav = isFavorite(identifier)

  function handleClick() {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleFavoriteClick(e) {
    e.stopPropagation() // Prevent card click
    // Normalize apartment object with address field for favorites
    const favoriteApartment = {
      ...apartment,
      address: identifier,
      rent: priceStr,
      beds: bedLabel,
      baths: bathLabel,
      'sq ft': sqftLabel
    }
    toggleFavorite(favoriteApartment)
  }

  // Image styling - use real image if available, otherwise show placeholder
  const imageStyle = image
    ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <div className="apt-card" onClick={handleClick} title={url ? 'View listing' : undefined}>
      <div className={`apt-card-img ${!image ? 'placeholder' : ''}`} style={imageStyle} />
      <button
        className={`apt-card-favorite ${isFav ? 'favorited' : ''}`}
        onClick={handleFavoriteClick}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFav ? '❤️' : '🤍'}
      </button>
      <div className="apt-card-body">
        <div className="apt-card-name">{name}</div>
        <div className="apt-card-details">
          <span>{bedLabel}</span>
          <span>·</span>
          <span>{bathLabel}</span>
          <span>·</span>
          <span>{sqftLabel}</span>
        </div>
        <div className={`apt-card-price ${price === null ? 'apt-card-price-na' : ''}`}>
          {priceStr}
        </div>
        <div className="apt-card-mgmt">{management}</div>
      </div>
    </div>
  )
}
