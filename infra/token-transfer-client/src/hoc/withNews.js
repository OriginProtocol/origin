import React, { Component } from 'react'

function withNews(WrappedComponent) {
  class WithNews extends Component {
    constructor(props) {
      super(props)
      this.state = { news: [] }
    }

    async componentDidMount() {
      this.setState({ news: await this.fetchNews() })
    }

    fetchNews = async () => {
      const mediumUrl = 'https://medium.com/feed/originprotocol'
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${mediumUrl}`
      )
      const json = await response.json()
      return json.items.map(item => {
        const tagIndex = item.description.indexOf('<img')
        const srcIndex =
          item.description.substring(tagIndex).indexOf('src=') + tagIndex
        const srcStart = srcIndex + 5
        const srcEnd =
          item.description.substring(srcStart).indexOf('"') + srcStart
        const imgSrc = item.description.substring(srcStart, srcEnd)
        const description =
          item.description.replace(/<[^>]*>?/gm, '').substr(0, 320) + '...'

        return {
          title: item.title,
          description: description,
          image: imgSrc,
          link: item.link
        }
      })
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          news={this.state.news}
        />
      )
    }
  }

  return WithNews
}

export default withNews
