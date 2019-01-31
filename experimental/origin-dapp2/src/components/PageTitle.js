import { Component } from 'react'

export default class PageTitle extends Component {
  componentDidMount() {
    const title = this.props.children
    document.title = title + ' - Origin'
  }

  render() {
    return null
  }
}
