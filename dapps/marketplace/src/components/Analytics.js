import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

/**
 * Records routing path changes to Google Analytics.
 */
class Analytics extends Component {
  constructor(props) {
    super(props)
    this._unlisten = () => {}
    this._afterTitleTimeout = undefined
    if (window.gtag == undefined) {
      window.gtag = () => {}
    }
  }

  componentDidMount() {
    const { history } = this.props
    // Record the current page
    this.onPageview()
    // history.listen will find future pages
    this._unlisten = history.listen(() => {
      this.onPageview()
    })
  }

  onPageview() {
    // We wait for react to render the page before capturing the page data
    // so that we collect what we hope is the the actual page title.
    // Many of our pages async load their data and don't get their real title
    // until later, and we miss recording the real title. That's okay though -
    // better to capture the page view.
    clearTimeout(this._afterTitleTimeout)
    this._afterTitleTimeout = setTimeout(() => {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '0.0.0.0') {
        return // We don't want to record automated testing or developers
      }
      const gaTrackingId = process.env.GA_TRACKING_ID || 'UA-106384880-2'
      const title = document.title
      const location = this.props.location
      const path = location.pathname + (location.search || '')
      window.gtag('config', gaTrackingId, {
        page_title: title,
        page_path: path
      })
    })
  }

  componentWillUnmount() {
    this._unlisten()
  }

  render() {
    return <>{this.props.children}</>
  }
}

export default withRouter(Analytics)
