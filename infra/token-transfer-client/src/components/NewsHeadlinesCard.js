import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Swiper from 'react-id-swiper'
import 'react-id-swiper/lib/styles/css/swiper.css'

import { fetchNews } from '@/actions/news'
import { getNews, getIsLoading as getNewsIsLoading } from '@/reducers/news'
import BorderedCard from '@/components/BorderedCard'

const NewsHeadlinesCard = props => {
  useEffect(props.fetchNews, [])

  if (props.newsIsLoading || props.error) return null

  const swiperParams = {
    autoHeight: true,
    slidesPerView: 1,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  }

  return (
    <BorderedCard shadowed={true}>
      <h2>News</h2>
      <Swiper {...swiperParams}>
        {props.news.map(item => {
          return (
            <div key={item.title}>
              <div className="title">{item.title}</div>
              <p>
                {item.description.substr(0, 120) + '...'}{' '}
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  [Read more]
                </a>
              </p>
            </div>
          )
        })}
      </Swiper>
    </BorderedCard>
  )
}

const mapStateToProps = ({ news }) => {
  return {
    news: getNews(news),
    newsIsLoading: getNewsIsLoading(news)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchNews: fetchNews
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewsHeadlinesCard)

require('react-styl')(`
  .title
    font-size: 28px
    font-weight: bold
    margin: 10px 0
  .swiper-pagination
    position: relative
  .swiper-pagination-bullets
    bottom: 0px !important
`)
