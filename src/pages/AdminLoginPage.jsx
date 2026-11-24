import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

const API_BASE = '/api'

export function isAdminLoggedIn() {
  return Boolean(localStorage.getItem('adminToken'))
}

export function adminLogout() {
  localStorage.removeItem('adminToken')
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Login failed')
      }
      localStorage.setItem('adminToken', data.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: '#f8f5f0' }}>
      <main className="store-main" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <section className="checkout-section" style={{ width: '100%', maxWidth: 480 }}>
          <p className="eyebrow dark">Bernard Fragrance</p>
          <h1>Admin Login</h1>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Sign in to manage perfumes.
          </p>

          {error && (
            <p className="empty-state" style={{ marginBottom: '1rem', color: '#8a1f1f', background: '#fdecec' }}>
              {error}
            </p>
          )}

          <form className="checkout-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </label>
            <div className="checkout-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
