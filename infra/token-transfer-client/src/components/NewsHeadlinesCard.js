import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Swiper from 'react-id-swiper'
import 'react-id-swiper/lib/styles/css/swiper.css'

import { fetchNews } from '@/actions/news'
import { getNews, getIsLoading as getNewsIsLoading } from '@/reducers/news'
import BorderedCard from '@/components/BorderedCard'

const NewsHeadlinesCard = props => {
  useEffect(props.fetchNews, [])
  const [swiper, setSwiper] = useState(null)

  if (props.newsIsLoading || props.error) return null

  const swiperParams = {
    autoHeight: true,
    slidesPerView: 1,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    loop: true
  }

  const onCardClick = event => {
    if (event.target.tagName !== 'A') {
      swiper.navigation.onNextClick(event)
    }
  }

  return (
    <BorderedCard shadowed={true} onClick={onCardClick}>
      <h2>News</h2>
      <Swiper {...swiperParams} getSwiper={setSwiper}>
        {props.news.map(item => {
          return (
            <div key={item.title}>
              <div className="title my-2">
                <strong style={{ fontSize: '20px' }}>{item.title}</strong>
              </div>
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
