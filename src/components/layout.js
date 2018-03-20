import React from 'react'
import Footer from './footer'
import NavBar from './navbar'

const Layout = ({ children, hideCreateLink, hideProfileLink }) => (
  <div>
    <main>
      <NavBar hideCreateLink={hideCreateLink} hideProfileLink={hideProfileLink} />
      {children}
    </main>
    <Footer />
  </div>
)

export default Layout
