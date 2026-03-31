import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layout/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminLogin from '../pages/Login/AdminLogin'
import Dashboard from '../pages/Dashboard/Dashboard'
import Inquiries from '../pages/Inquiries/Inquiries'
import GalleryManager from '../pages/GalleryManager/GalleryManager'
import EventsManager from '../pages/EventsManager/EventsManager'
import ServicesManager from '../pages/ServicesManager/ServicesManager'
import Settings from '../pages/Settings/Settings'
import Bookings from '../pages/Booking/Booking'

export default function AdminApp() {
  return (
    <Routes>

      {/* Public admin route — login page */}
      <Route path="login" element={<AdminLogin />} />

      {/* Protected admin routes — wrapped in sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="bookings"  element={<Bookings />} />
        <Route path="gallery"   element={<GalleryManager />} />
        <Route path="events"    element={<EventsManager />} />
        <Route path="services"  element={<ServicesManager />} />
        <Route path="settings"  element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />

    </Routes>
  )
}