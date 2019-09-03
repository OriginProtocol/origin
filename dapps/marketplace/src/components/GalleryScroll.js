import React, { useRef, useState, useEffect } from 'react'
import debounce from 'lodash/debounce'

const GalleryScroll = ({ pics = [] }) => {
  const [offset, setOffset] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [zoom, setZoomRaw] = useState(false)

  function setZoom(zoom) {
    if (!zoom) {
      document.body.style.position = ''
      window.scrollTo(0, scrollOffset)
    } else {
      setScrollOffset(window.pageYOffset)
      document.body.style.position = 'fixed'
    }
    setZoomRaw(zoom)
  }

  const props = { offset, setOffset, pics }

  return (
    <>
      {zoom && (
        <div className="gallery-mobile-zoom">
          <a
            href="#close"
            onClick={e => {
              e.preventDefault()
              setZoom(false)
            }}
          >
            &times;
          </a>
          <GalleryScrollInner {...props} />
        </div>
      )}
      <GalleryScrollInner {...props} onZoom={() => setZoom(true)} />
    </>
  )
}

const GalleryScrollInner = ({ pics = [], onZoom, offset, setOffset }) => {
  if (!pics.length) return null

  const scrollEl = useRef(null)

  useEffect(() => {
    const el = scrollEl.current
    const handleScroll = debounce(() => {
      const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth)
      setOffset(Math.round(pct * (pics.length - 1)))
    }, 100)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollEl.current])

  useEffect(() => {
    const width = scrollEl.current.clientWidth
    scrollEl.current.scrollTo(width * offset, 0)
  }, [offset])

  return (
    <>
      <div className="gallery-scroll-wrap">
        <div ref={scrollEl} className="gallery-scroll">
          {pics.map((pic, idx) => (
            <div
              className="pic"
              onClick={() => (onZoom ? onZoom() : null)}
              key={idx}
              style={{ backgroundImage: `url(${pic.urlExpanded})` }}
            />
          ))}
        </div>
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
    </>
  )
}

export default GalleryScroll

require('react-styl')(`
  .gallery-scroll-wrap
    position: relative
    .gallery-scroll
      overscroll-behavior-x: contain
      height: 50vh
      width: 100%
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
  .ticks
    display: flex
    flex-direction: row
    justify-content: center
    flex-wrap: wrap
    margin: 1rem 0 0.75rem 0
    .tick
      width: 6px
      height: 6px
      border-radius: 50%
      background-color: var(--dark)
      box-shadow: 0px 0px 1px 1px white
      margin: 0 4px 4px 4px
      opacity: 0.1
      &.active
        opacity: 1

  .gallery-mobile-zoom
    border-radius: 0 !important
    width: 100%
    touch-action: none
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: #000;
    display: flex;
    justify-content: center;
    flex-direction: column
    > a
      position: absolute
      top: 0
      right: 0
      color: #fff
      width: 2.5rem
      height: 2.5rem
      z-index: 5
      font-size: 24px
      line-height: 1
      display: flex;
      align-items: center;
      justify-content: center;
    .gallery-scroll-wrap
      flex: 1
      .gallery-scroll
        height: 100%
        .pic
          height: 100%
    .ticks .tick
      opacity: 0.5
      background-color: white
      box-shadow: 0px 0px 1px 1px var(--dark)
      &.active
        opacity: 1


`)
