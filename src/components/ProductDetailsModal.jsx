function renderStars(rating) {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

export default function ProductDetailsModal({ product, onClose, onAddToCart }) {
  if (!product) return null
  const available = product.isAvailable !== false && Number(product.stock) > 0

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="icon-button modal-close" onClick={onClose}>
          Close
        </button>
        <div className="modal-content">
          <div className="modal-image" style={{ backgroundColor: '#f3efe8' }}>
            <img src={product.imageUrl} alt={product.name} />
          </div>
          <div className="modal-info">
            <p className="product-brand">{product.category}</p>
            <h2 id="product-details-title">{product.name}</h2>
            <p className="product-meta">
              {available ? `In stock: ${product.stock}` : 'Out of stock'}
            </p>
            <p className="product-description">{product.description}</p>
            <div className="detail-block detail-grid">
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Availability:</strong> {available ? 'Available' : 'Not available'}
              </p>
            </div>
            <div className="modal-actions">
              <span className="product-price">GHS {Number(product.price).toFixed(2)}</span>
              <button type="button" onClick={() => onAddToCart(product._id)} disabled={!available}>
                {available ? 'Add to cart' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
