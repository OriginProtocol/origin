import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchNews } from '@/actions/news'
import {
  getNews,
  getIsLoading as getNewsIsLoading
} from '@/reducers/news'
import NewsCard from '@/components/NewsCard'

const News = props => {
  useEffect(props.fetchNews, [])

  if (props.newsIsLoading || props.error) return null

  return (
    <div>
      <h1>News</h1>
      <div className="row">
        <div className="col">
          <NewsCard {...props.news[0]} feature={true} />
        </div>
      </div>
      <div className="row">
        {props.news.slice(1, 4).map(item => (
          <div className="col-12 col-lg-6 col-xl-4" key={item.title}>
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

const mapStateToProps = ({ news }) => {
  return {
    news: getNews(news),
    newsIsLoading: getNewsIsLoading(news),
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchNews: fetchNews
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(News)
