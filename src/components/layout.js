import React from 'react'
import Footer from './footer'
import NavBar from './navbar'

const Layout = ({ children }) => (
  <div>
    <main>
      <NavBar />
      {children}
    </main>
    <Footer />
  </div>
)

export default Layout
