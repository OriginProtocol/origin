import React, { useRef, useState, useEffect } from 'react'

import withNews from '../hoc/withNews'

const NewsHeadlinesCard = ({ news = [] }) => {
  if (!news.length) return null

  const scrollEl = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = scrollEl.current
    const handleScroll = () => {
      const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth)
      setOffset(Math.round(pct * (news.length - 1)))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollEl.current])

  return (
    <div className="card-wrapper">
      <div className="row">
        <div className="col">
          <h2>News</h2>
        </div>
      </div>
      <div className="headline-swiper-wrapper">
        <div className="row">
          <div ref={scrollEl} className="col headline-swiper">
            {news.map(item => (
              <div className="item" key={item.title}>
                <div className="title">{item.title}</div>
                <p>
                  {item.description.substr(0, 120) + '...'}{' '}
                  <a href={item.link}>[Read more]</a>
                </p>
              </div>
            ))}
          </div>
        </div>
        {news.length === 1 ? null : (
          <div className="row">
            <div className="col">
              <div className="ticks">
                {news.map((item, i) => (
                  <div
                    className={`tick${offset === i ? ' active' : ''}`}
                    key={i}
                    onClick={() => {
                      const width = scrollEl.current.clientWidth
                      scrollEl.current.scrollTo(width * i, 0)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default withNews(NewsHeadlinesCard)

require('react-styl')(`
  .headline-swiper-wrapper
    position: relative
    .headline-swiper
      overflow-behaviour-x: contain
      height: 10vh
      scroll-snap-type: x mandatory
      -webkit-overflow-scrolling: touch
      overflow-x: scroll
      overflow-y: hidden
      -webkit-appearance: none
      scrollbar-width: none
      &::-webkit-scrollbar
        display: block
        -webkit-appearance: none
        background-color: transparent
        &-thumb,&-track
          background-color: transparent
          -webkit-appearance: none
    .item
      display: inline-block
      width: 100%
      height: 10vh
      .title
        font-size: 28px
        font-weight: bold
        margin: 10px 0
    .ticks
      margin-top: 20px
      display: flex
      flex-direction: row
      justify-content: center
      .tick
        width: 10px
        height: 10px
        border-radius: 50%
        background-color: var(--dark)
        box-shadow: 0px 0px 1px 1px white
        margin: 0 4px
        opacity: 0.1
        &.active
          opacity: 1
`)
