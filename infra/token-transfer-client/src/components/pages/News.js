import React, { Component } from 'react'
import { connect } from 'react-redux'

import NewsCard from '../NewsCard'

class News extends Component {
  constructor(props) {
    super(props)
    this.state = { news: [] }
  }

  componentDidMount() {
    this.refreshNews()
  }

  refreshNews = async () => {
    const mediumUrl = 'https://medium.com/feed/originprotocol'
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${mediumUrl}`
    )
    const json = await response.json()
    const news = json.items.map(item => {
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

    this.setState({ news })
  }

  render() {
    const featuredItem = this.state.news.shift()
    const otherItems = this.state.news.slice(0, 3)

    console.log(otherItems)

    return (
      <div>
        <h1>News</h1>

        <div className="row">
          <div className="col">
            <NewsCard {...featuredItem} feature={true} />
          </div>
        </div>

        <div className="row">
          {otherItems.map(item => (
            <div className="col" key={item.title}>
              <NewsCard
                {...item}
                description={item.description.substr(0, 120) + '...'}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(News)
