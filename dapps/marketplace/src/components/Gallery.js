import React, { useState, useEffect } from 'react'

const Gallery = ({ pics = [] }) => {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  useEffect(() => {
    if (zoom) {
      document.body.className += ' pl-modal-open'
    }
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.className = document.body.className.replace(
        ' pl-modal-open',
        ''
      )
    }
  }, [zoom])
  const current = pics[active]
  if (!current) return null

  const backgroundImage = `url(${current.urlExpanded})`

  return (
    <div className="gallery">
      {zoom && (
        <div className="zoom" onClick={() => setZoom(false)}>
          {pics.length > 1 && (
            <a
              href="#prev"
              className="prev"
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                setActive(active === 0 ? pics.length - 1 : active - 1)
              }}
            />
          )}
          <div className="zoom-pic">
            <img src={current.urlExpanded} />
          </div>
          {pics.length > 1 && (
            <a
              href="#next"
              className="next"
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                setActive(active === pics.length - 1 ? 0 : active + 1)
              }}
            />
          )}
          <a
            href="#close"
            className="close"
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              setZoom(false)
            }}
          />
        </div>
      )}
      <div
        className="main-pic"
        style={{ backgroundImage }}
        onClick={() => setZoom(true)}
      />
      {pics.length === 1 ? null : (
        <div className="thumbnails">
          <div className="inner">
            {pics.map((m, idx) => (
              <div
                key={idx}
                onClick={() => setActive(idx)}
                style={{ backgroundImage: `url(${m.urlExpanded})` }}
                className={active === idx ? 'active' : ''}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery

require('react-styl')(`
  .gallery
    display: flex
    flex-direction: column
    .zoom
      position: fixed
      cursor: pointer
      top: 0
      left: 0
      right: 0
      bottom: 0
      background: rgba(0,0,0,0.75)
      z-index: 501
      display: flex
      flex-direction: row
      justify-content: center
      align-items: center
      .zoom-pic
        height: 90%
        width: 90%
        display: flex
        align-items: center
        justify-content: center
        img
          max-width: 100%
          max-height: 100%
      .prev,.next
        display: block
        width: 100px
        height: 100%
        background: url(images/left-arrow-large.svg) no-repeat center
        opacity: 0.5
        &:hover
          opacity: 1
        &.next
          background-image: url(images/right-arrow-large.svg)
      .close
        display: block
        position: absolute
        top: 0
        right: 0
        width: 100px
        height: 100px
        background: url(images/close-button-lg.svg) no-repeat center
        opacity: 0.5
        &:hover
          opacity: 1

    .main-pic
      flex: 1
      height: 100%
      cursor: pointer
    .thumbnails
      height: 80px
      .inner
        height: 100%
        overflow-x: scroll
        overflow-y: hidden
        white-space: nowrap
        > div
          width: 100px
          height: 100%
          border-radius: 5px
          display: inline-block
          background-position: center
          background-repeat: no-repeat
          background-size: cover
          background-origin: content-box
          cursor: pointer
          opacity: 0.75
          &:not(:last-child)
            margin-right: 0.75rem
          &:hover
            opacity: 1
          &.active
            opacity: 1

  @media (max-width: 767.98px)
    .gallery
      flex-direction: column
      .thumbnails
        margin-top: 1rem
        overflow: auto
        width: auto
        margin-left: 0
        .inner
          flex-direction: row
          justify-content: center
          > div
            width: 75px
            height: 50px
`)
