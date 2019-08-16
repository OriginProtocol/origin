import React from 'react'
import Swiper from 'react-id-swiper'
import 'react-id-swiper/lib/styles/css/swiper.css'

import withNews from '@/hoc/withNews'
import BorderedCard from '@/components/BorderedCard'

const NewsHeadlinesCard = ({ news = [] }) => {
  if (!news.length) return null

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
        {news.map(item => {
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

export default withNews(NewsHeadlinesCard)

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
