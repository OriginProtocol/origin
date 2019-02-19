import { Component } from 'react'
import get from 'lodash/get'

export default class PageTitle extends Component {
  componentDidMount() {
    const content = get(
      this.props,
      'children.props.content',
      this.props.children
    )
    const title = this._cleanTitle(content)
    document.title = title + ' - Origin'
  }

  _cleanTitle(raw) {
    // Since we are using react children for the title,
    // we get in multiple text elements if variables are used.
    // If so, join and clean up whitespace.
    return (Array.isArray(raw) ? raw.join(' ') : raw).replace(/\s{2,}/, ' ')
  }

  render() {
    return null
  }
}
