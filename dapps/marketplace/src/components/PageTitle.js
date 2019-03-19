import { Component } from 'react'
import get from 'lodash/get'

import withCreatorConfig from 'hoc/withCreatorConfig'

class PageTitle extends Component {
  componentDidMount() {
    const siteTitle = get(this.props, 'creatorConfig.title') || 'Origin'
    if (!this.props.children) return siteTitle
    const pageTitle = this._cleanPageTitle(this.props.children)
    document.title = `${pageTitle} - ${siteTitle}`
  }

  _cleanPageTitle(raw) {
    // Since we are using react children for the title,
    // we get in multiple text elements if variables are used.
    // If so, join and clean up whitespace.
    return (Array.isArray(raw) ? raw.join(' ') : raw).replace(/\s{2,}/, ' ')
  }

  render() {
    return null
  }
}

export default withCreatorConfig(PageTitle)
