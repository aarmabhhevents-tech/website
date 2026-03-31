import { Outlet } from 'react-router-dom'
import Navbar from './Navbar/Navbar'     // your existing navbar
import Footer from './Footer/Footer'     // your existing footer

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}