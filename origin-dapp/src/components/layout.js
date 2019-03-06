import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import queryString from 'query-string'

import Footer from 'components/footer'
import NavBar from 'components/navbar'
import Warning from 'components/warning'

class Layout extends Component {
  render() {
    const { children, location } = this.props
    const query = queryString.parse(location.search)

    return !query['no-nav'] ? (
      <Fragment>
        <main className="d-flex flex-column">
          <Warning />
          <NavBar />
          {children}
        </main>
        <Footer />
      </Fragment>
    ) : (
      <main className="no-nav">
        {children}
      </main>
    )
  }
}

export default withRouter(Layout)
