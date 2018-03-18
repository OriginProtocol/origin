import React from 'react'
import Footer from './footer'
import NavBar from './navbar'

const Layout = ({ children, hideCreateButton, hideLoginButton }) => (
  <div>
    <main>
      <NavBar hideCreateButton={hideCreateButton} hideLoginButton={hideLoginButton} />
      {children}
    </main>
    <Footer />
  </div>
)

export default Layout
