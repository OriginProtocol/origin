import React, { Fragment } from 'react'

import Footer from 'components/footer'
import NavBar from 'components/navbar'

const Layout = ({ children }) => (
  <Fragment>
    <main className="d-flex flex-column">
      <NavBar />
      {children}
    </main>
    <Footer />
  </Fragment>
)

export default Layout
