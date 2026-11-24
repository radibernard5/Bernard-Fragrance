export default function CartPanel({
  isOpen,
  items,
  subtotal,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) {
  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
        onClick={onClose}
      />
      <aside
        className={`cart-panel ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty. Discover your signature scent.</p>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item._id} className="cart-item">
                  <div className="cart-item-main">
                    <div
                      className="cart-item-thumb"
                      style={{ backgroundColor: '#f3efe8' }}
                      aria-hidden="true"
                    >
                      <img src={item.imageUrl} alt="" />
                    </div>
                    <div>
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-meta">{item.category}</p>
                      <p className="cart-item-price">GHS {Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <label>
                      <span className="sr-only">Quantity for {item.name}</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(item._id, Number(e.target.value))
                        }
                      />
                    </label>
                    <button type="button" onClick={() => onRemove(item._id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>GHS {Number(subtotal).toFixed(2)}</strong>
              </div>
              <button type="button" className="checkout-button" onClick={onCheckout}>
                Close Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
