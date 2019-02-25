import { Component } from 'react'

export default class PageTitle extends Component {
  componentDidMount() {
    if (!this.props.children) return 'Origin'
    const title = this._cleanTitle(this.props.children)
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
