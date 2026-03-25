export default function ApartmentCard({ apartment }) {
  const { name, beds, baths, sqft, price, management, url } = apartment

  const bedLabel  = beds === 0 ? 'Studio' : `${beds} bed${beds !== 1 ? 's' : ''}`
  const bathLabel = baths !== null ? `${baths} bath${baths !== 1 ? 's' : ''}` : null
  const sqftLabel = sqft  !== null ? `${sqft.toLocaleString()} sqft` : null
  const priceStr  = price !== null ? `$${price.toLocaleString()}/mo` : 'Contact for price'

  function handleClick() {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="apt-card" onClick={handleClick} title={url ? 'View listing' : undefined}>
      <div className="apt-card-img" />
      <div className="apt-card-body">
        <div className="apt-card-name">{name}</div>
        <div className="apt-card-details">
          <span>{bedLabel}</span>
          {bathLabel && <><span>·</span><span>{bathLabel}</span></>}
          {sqftLabel && <><span>·</span><span>{sqftLabel}</span></>}
        </div>
        <div className={`apt-card-price ${price === null ? 'apt-card-price-na' : ''}`}>
          {priceStr}
        </div>
        <div className="apt-card-mgmt">{management}</div>
      </div>
    </div>
  )
}
