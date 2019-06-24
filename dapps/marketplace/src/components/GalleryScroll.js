import React, { useRef, useState, useEffect } from 'react'

const GalleryScroll = ({ pics = [] }) => {
  if (!pics.length) return null

  const scrollEl = useRef(null)
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const el = scrollEl.current
    const handleScroll = () => {
      const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth)
      setOffset(Math.round(pct * (pics.length - 1)))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollEl.current])

  return (
    <div className="gallery-scroll-wrap">
      <div ref={scrollEl} className="gallery-scroll">
        {pics.map((pic, idx) => (
          <div
            className="pic"
            key={idx}
            style={{ backgroundImage: `url(${pic.urlExpanded})` }}
          />
        ))}
      </div>
      {pics.length === 1 ? null : (
        <div className="ticks">
          {pics.map((pic, idx) => (
            <div
              className={`tick${offset === idx ? ' active' : ''}`}
              key={idx}
              onClick={() => {
                const width = scrollEl.current.clientWidth
                scrollEl.current.scrollTo(width * idx, 0)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GalleryScroll

require('react-styl')(`
  .gallery-scroll-wrap
    position: relative
    .ticks
      display: flex
      flex-direction: row
      position: absolute
      bottom: 10px
      left: 0
      width: 100%
      justify-content: center
      .tick
        width: 10px
        height: 10px
        border-radius: 50%
        background-color: #bbb
        box-shadow: 0px 0px 1px 1px white
        margin: 0 4px
        &.active
          background-color: white
          box-shadow: 0px 0px 1px 2px #aaa
    .gallery-scroll
      overscroll-behavior-x: contain
      height: 50vh
      scroll-snap-type: x mandatory
      -webkit-overflow-scrolling: touch
      overflow-x: scroll
      overflow-y: hidden
      white-space: nowrap
      -webkit-appearance: none
      scrollbar-width: none
      &::-webkit-scrollbar
        display: block
        -webkit-appearance: none
        background-color: transparent
        &-thumb,&-track
          background-color: transparent
          -webkit-appearance: none
      .pic
        display: inline-block
        scroll-snap-align: center
        scroll-snap-stop: always
        width: 100%
        height: 50vh
        background-size: contain
        background-repeat: no-repeat
        background-position: center

`)
