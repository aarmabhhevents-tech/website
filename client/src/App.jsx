import { Routes, Route } from 'react-router-dom'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Services from './Pages/Services'
import Events from './Pages/Events'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Public layout (Navbar + Footer wrapper)
import PublicLayout from './Components/PublicLayout'

// Admin
import AdminApp from './admin/pages/AdminApp'

export default function App() {
  return (
    <Routes>

      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"         element={<Home />} />
        <Route path="/about"    element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/events"   element={<Events />} />
        <Route path="/gallery"  element={<Gallery />} />
        <Route path="/contact"  element={<Contact />} />
        <Route path="*"         element={<NotFound />} />
      </Route>

      {/* ── Admin routes ── */}
      <Route path="/admin/*" element={<AdminApp />} />

    </Routes>
  )
}