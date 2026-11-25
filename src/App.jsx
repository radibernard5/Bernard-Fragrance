import { Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './App.css'
import ShopPage from './pages/ShopPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage, { isAdminLoggedIn } from './pages/AdminLoginPage'

function ProtectedAdminRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ShopPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  )
}

export default App
