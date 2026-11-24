function renderStars(rating) {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

export default function ProductCard({ product, onAddToCart, onViewDetails }) {
  const available = product.isAvailable !== false && Number(product.stock) > 0

  return (
    <article className="product-card">
      <button
        type="button"
        className="product-image-button"
        onClick={() => onViewDetails(product)}
        aria-label={`View details for ${product.name}`}
      >
        <div className="product-image" style={{ backgroundColor: '#f3efe8' }}>
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        </div>
      </button>
      <div className="product-info">
        <p className="product-brand">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-meta">
          {available ? `In stock: ${product.stock}` : 'Out of stock'}
        </p>
        <p className="product-description-preview">
          {product.description?.length > 90
            ? `${product.description.slice(0, 90)}...`
            : product.description}
        </p>
        <div className="product-footer">
          <span className="product-price">GHS {Number(product.price).toFixed(2)}</span>
          <div className="card-actions">
            <button type="button" className="secondary" onClick={() => onViewDetails(product)}>
              View Details
            </button>
            <button type="button" onClick={() => onAddToCart(product._id)} disabled={!available}>
              {available ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
