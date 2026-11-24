import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import CartPanel from '../components/CartPanel'
import ProductDetailsModal from '../components/ProductDetailsModal'
import Footer from '../components/Footer'

const API_BASE = '/api'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [cart, setCart] = useState({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/products`)
      if (!res.ok) throw new Error('Failed to fetch perfumes')
      const data = await res.json()
      setProducts(data?.data?.products || [])
    } catch (err) {
      setError(err.message || 'Failed to load perfumes')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const categories = ['All', 'Men', 'Women', 'Unisex']

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
      const haystack = [product.name, product.description, product.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      return matchesCategory && matchesQuery
    })
  }, [products, searchQuery, categoryFilter])

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((p) => p._id === id)
          if (!product) return null
          return { ...product, quantity }
        })
        .filter(Boolean),
    [cart, products],
  )

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
    setIsCartOpen(true)
  }

  const updateQuantity = (productId, quantity) => {
    if (!Number.isFinite(quantity) || quantity < 1) return
    setCart((prev) => ({ ...prev, [productId]: quantity }))
  }

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartToggle={() => setIsCartOpen((open) => !open)}
        navCategories={['Men', 'Women', 'Unisex']}
        activeNavCategory={categoryFilter}
        onNavSelect={(category) => setCategoryFilter(category === 'All' ? 'All' : category)}
      />

      <main className="store-main">
        <section className="hero-banner">
          <div className="hero-content">
            <p className="eyebrow">Bernard Fragrance</p>
            <h1>Discover your signature scent</h1>
            <p>
              Shop authentic Bernard Fragrance perfumes fetched directly from our database.
              Explore Men, Women, and Unisex collections in GHS.
            </p>
            <button
              type="button"
              className="hero-cta"
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Shop Perfumes
            </button>
          </div>
        </section>

        <section id="catalog" className="catalog-section">
          <div className="catalog-header">
            <div>
              <p className="eyebrow dark">Our Collection</p>
              <h2>Perfumes</h2>
            </div>
            <div className="catalog-summary">
              <span>{filteredProducts.length} perfume{filteredProducts.length === 1 ? '' : 's'}</span>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('All')
                }}
              >
                Reset filters
              </button>
            </div>
          </div>

          <div className="catalog-layout">
            <aside className="filters-panel" aria-label="Filters">
              <h3>Filter</h3>
              <div className="filter-group">
                <p className="filter-label">Category</p>
                <div className="filter-options">
                  {categories.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`filter-chip ${categoryFilter === option ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <button type="button" className="secondary" onClick={fetchProducts}>
                  Refresh
                </button>
              </div>
            </aside>

            <div className="catalog-results">
              {loading ? (
                <p className="empty-state">Loading perfumes...</p>
              ) : error ? (
                <p className="empty-state">{error}</p>
              ) : products.length === 0 ? (
                <p className="empty-state">No perfumes yet</p>
              ) : filteredProducts.length === 0 ? (
                <p className="empty-state">No perfumes match your selection.</p>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={addToCart}
                      onViewDetails={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <CartPanel
        isOpen={isCartOpen}
        items={cartItems}
        subtotal={subtotal}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => setIsCartOpen(false)}
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(id) => addToCart(id)}
      />
    </div>
  )
}
