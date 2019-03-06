import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

class Analytics extends Component {

  componentDidUpdate(props) {
    this.trackHashChange(props)
  }

  trackHashChange({ location, history }) {
    const gaTrackingId = process.env.GA_TRACKING_ID || 'UA-106384880-2'
    const gtag = window.gtag || function() {}
    const path = this.props.location.pathname

    if (location.pathname === path) {
      return
    }

    if (history.action === 'PUSH') {
      gtag('config', gaTrackingId, {
        'page_title': this.getPageTitle(path),
        'page_path': path,
      })
    }
  }

  getPageTitle(path) {
    const pathNoSlash = path.substring(1)
    const nextParamIdx = pathNoSlash.indexOf('/')
    let pageTitle = nextParamIdx > -1 ? 
      pathNoSlash.substring(0, nextParamIdx) :
      pathNoSlash.substring(0, pathNoSlash.length)

    if (!pageTitle) {
      pageTitle = 'home'
    }

    return pageTitle
  }

  render() {
    return (
      <Fragment>
        {this.props.children}
      </Fragment>
    )
  }
}


export default withRouter(
  connect()(Analytics)
)
