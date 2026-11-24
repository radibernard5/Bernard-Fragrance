import { Link } from 'react-router-dom'

export default function Header({
  cartCount,
  searchQuery,
  onSearchChange,
  onCartToggle,
  navCategories,
  activeNavCategory,
  onNavSelect,
}) {
  return (
    <header className="site-header">
      <div className="header-top">
        <button
          type="button"
          className="brand brand-button"
          onClick={() => onNavSelect('All')}
          aria-label="Bernard Fragrance home"
        >
          <span className="brand-mark">BF</span>
          <span className="brand-name">Bernard Fragrance</span>
        </button>

        <label className="search-field">
          <span className="sr-only">Search perfumes</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search perfumes..."
          />
        </label>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" className="cart-button" onClick={onCartToggle}>
            <span aria-hidden="true">🛒</span>
            <span>Cart</span>
            <span className="cart-count" aria-label={`${cartCount} items in cart`}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      <nav className="category-nav" aria-label="Product categories">
        <button
          type="button"
          className={`nav-link ${activeNavCategory === 'All' ? 'active' : ''}`}
          onClick={() => onNavSelect('All')}
        >
          All Perfumes
        </button>
        {navCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`nav-link ${activeNavCategory === category ? 'active' : ''}`}
            onClick={() => onNavSelect(category)}
          >
            {category}
          </button>
        ))}
      </nav>
    </header>
  )
}
