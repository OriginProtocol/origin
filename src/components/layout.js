import React, { Fragment } from 'react'

import Footer from 'components/footer'
import NavBar from 'components/navbar'
import Warning from 'components/warning'

const Layout = ({ children }) => (
  <Fragment>
    <main className="d-flex flex-column">
      <Warning />
      <NavBar />
      {children}
    </main>
    <Footer />
  </Fragment>
)

export default Layout
