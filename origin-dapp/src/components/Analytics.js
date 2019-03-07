import React, { Component } from 'react'
import { withRouter } from 'react-router'

class Analytics extends Component {
  constructor(props) {
    super(props)
    this._unlisten = () => {}
    this._afterTitleTimeout = undefined
    if (window.gtag == undefined) {
      window.gtag = () => {}
    }
  }

  /**
   * Records routing path changes to Google Analytics.
   *
   * Uses setTimeout to wait until the intial page rendering is complete
   * so that it can collect the correct document title.
   */

  componentDidMount() {
    const { history } = this.props
    this._unlisten = history.listen(location => {
      clearTimeout(this._afterTitleTimeout)
      this._afterTitleTimeout = setTimeout(() => {
        const gaTrackingId = process.env.GA_TRACKING_ID || 'UA-106384880-2'
        window.gtag('config', gaTrackingId, {
          page_title: document.title,
          page_path: location.pathname
        })
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
