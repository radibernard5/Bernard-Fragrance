import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminLogout } from './AdminLoginPage'

const API_BASE = '/api'

const initialForm = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  category: 'Men',
  stock: '',
}

function authHeaders() {
  const token = localStorage.getItem('adminToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      adminLogout()
      navigate('/admin/login', { replace: true })
      return true
    }
    return false
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/products`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch perfumes')
      setProducts(data?.data?.products || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load perfumes' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name || '',
      price: String(product.price ?? ''),
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      category: product.category || 'Men',
      stock: String(product.stock ?? ''),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this perfume? This cannot be undone.')) return
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (handleAuthError(res.status)) return
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Failed to delete perfume')
      }
      setMessage({ type: 'success', text: 'Perfume deleted successfully.' })
      if (editingId === id) resetForm()
      await fetchProducts()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete perfume' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      category: form.category,
      stock: Number(form.stock),
      isAvailable: Number(form.stock) > 0,
    }

    try {
      const url = editingId ? `${API_BASE}/products/${editingId}` : `${API_BASE}/products`
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      if (handleAuthError(res.status)) return
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save perfume')

      setMessage({
        type: 'success',
        text: editingId
          ? 'Perfume updated successfully. Changes appear on the website immediately.'
          : 'Perfume saved successfully. It will appear on the website immediately.',
      })
      resetForm()
      await fetchProducts()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save perfume' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: '#f8f5f0' }}>
      <header className="site-header" style={{ position: 'sticky', top: 0 }}>
        <div className="header-top">
          <div className="brand brand-button" aria-label="Bernard Fragrance admin">
            <span className="brand-mark">BF</span>
            <span className="brand-name">Bernard Fragrance Admin</span>
          </div>
          <button type="button" className="cart-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="store-main">
        <section className="checkout-section">
          <h1>{editingId ? 'Edit Perfume' : 'Add New Perfume'}</h1>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Manage perfumes in MongoDB. Changes appear on the website immediately.
          </p>

          {message.text && (
            <p
              className="empty-state"
              style={{
                marginBottom: '1rem',
                color: message.type === 'success' ? '#1f6f43' : '#8a1f1f',
                background: message.type === 'success' ? '#eaf7ef' : '#fdecec',
              }}
            >
              {message.text}
            </p>
          )}

          <form className="checkout-form" onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
            <label>
              Name
              <input name="name" type="text" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Price (GHS)
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Image URL
              <input
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
            </label>

            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </label>

            <label>
              Stock
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </label>

            <div className="checkout-actions">
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm} disabled={submitting}>
                  Cancel Edit
                </button>
              )}
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Perfume' : 'Save Perfume'}
              </button>
            </div>
          </form>
        </section>

        <section className="checkout-section" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>All Perfumes</h2>
            <button type="button" className="secondary" onClick={fetchProducts}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="empty-state">Loading perfumes...</p>
          ) : products.length === 0 ? (
            <p className="empty-state">No perfumes yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Price (GHS)</th>
                    <th style={{ padding: '0.75rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem' }}>Available</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem' }}>{product.name}</td>
                      <td style={{ padding: '0.75rem' }}>{product.category}</td>
                      <td style={{ padding: '0.75rem' }}>{Number(product.price).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem' }}>{product.stock}</td>
                      <td style={{ padding: '0.75rem' }}>{product.isAvailable ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button type="button" className="secondary" onClick={() => handleEdit(product)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(product._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
