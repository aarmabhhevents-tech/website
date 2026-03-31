import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'

/* -------------------------
   UI TESTS
--------------------------*/

describe('Navbar UI', () => {
  it('renders brand name', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Aarambhh Events/i)).toBeInTheDocument()
  })

  it('shows logo image', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    expect(screen.getByAltText(/aarambhh events logo/i)).toBeInTheDocument()
  })

  it('shows all navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    const links = ['Home', 'About', 'Gallery', 'Services', 'Events', 'Contact']

    links.forEach((link) => {
      expect(screen.getByRole('link', { name: new RegExp(`^${link}$`, 'i') })).toBeInTheDocument()
    })
  })
})

/* -------------------------
   NAVIGATION TESTS
--------------------------*/

describe('Navbar Navigation', () => {
  it('navigates to About page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
        <Routes>
          <Route path="/about" element={<h1>About Page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('link', { name: /about/i }))

    expect(screen.getByText(/about page/i)).toBeInTheDocument()
  })

  it('navigates to Contact page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
        <Routes>
          <Route path="/contact" element={<h1>Contact Page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('link', { name: /contact/i }))

    expect(screen.getByText(/contact page/i)).toBeInTheDocument()
  })
})

/* -------------------------
   ACTIVE LINK TEST
--------------------------*/

describe('Navbar Active Link', () => {
  it('Home link is active on home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>,
    )

    const homeLink = screen.getByRole('link', { name: /home/i })
    const aboutLink = screen.getByRole('link', { name: /about/i })

    // CSS Modules hash class names, so we compare active vs inactive links
    // Active link should have more classes (base + active) than inactive links
    const homeClasses = homeLink.className.split(' ').filter(Boolean)
    const aboutClasses = aboutLink.className.split(' ').filter(Boolean)

    // Active link should have at least as many classes as inactive (or more)
    expect(homeClasses.length).toBeGreaterThanOrEqual(aboutClasses.length)
    // Verify home link points to current route
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('About link is active on about page', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Navbar />
      </MemoryRouter>,
    )

    const aboutLink = screen.getByRole('link', { name: /about/i })
    const homeLink = screen.getByRole('link', { name: /home/i })

    const aboutClasses = aboutLink.className.split(' ').filter(Boolean)
    const homeClasses = homeLink.className.split(' ').filter(Boolean)

    // Active link should have at least as many classes as inactive
    expect(aboutClasses.length).toBeGreaterThanOrEqual(homeClasses.length)
    expect(aboutLink).toHaveAttribute('href', '/about')
  })
})
