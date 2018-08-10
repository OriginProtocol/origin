import React, { Fragment } from 'react'

import Footer from 'components/footer'
import NavBar from 'components/navbar'
import SearchBar from 'components/search/searchbar'

const Layout = ({ children }) => (
  <Fragment>
    <main className="d-flex flex-column">
      <NavBar />
      <SearchBar />
      {children}
    </main>
    <Footer />
  </Fragment>
)

export default Layout
