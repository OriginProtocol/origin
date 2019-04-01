import { Component } from 'react'
import get from 'lodash/get'

import withCreatorConfig from 'hoc/withCreatorConfig'

class DocumentTitle extends Component {
  componentDidMount() {
    const siteTitle = get(this.props, 'creatorConfig.title') || 'Origin'
    const { pageTitle } = this.props
    if (!pageTitle) return siteTitle
    document.title = `${pageTitle} - ${siteTitle}`
  }

  render() {
    return null
  }
}

export default withCreatorConfig(DocumentTitle)
