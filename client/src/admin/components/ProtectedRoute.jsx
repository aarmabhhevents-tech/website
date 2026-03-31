import { Navigate } from 'react-router-dom'

// Simple token-based guard.
// Swap localStorage check with your Supabase auth context later.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token')

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}