import React, { useState, useEffect, useRef } from 'react'

const Zoom = ({ pics = [], onClose, initialActive }) => {
  const [active, setActive] = useState(initialActive)
  const current = pics[active]

  // Prevent body scrolling when lightbox is open
  useEffect(() => {
    document.body.className += ' pl-modal-open'
    return () => {
      document.body.className = document.body.className.replace(
        ' pl-modal-open',
        ''
      )
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.keyCode === 39) {
        // Right arrow
        setActive(active === pics.length - 1 ? 0 : active + 1)
      } else if (e.keyCode === 37) {
        // Left arrow
        setActive(active === 0 ? pics.length - 1 : active - 1)
      } else if (e.keyCode === 27) {
        // Esc
        onClose(active)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  return (
    <div className="zoom" onClick={() => onClose(active)}>
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
        <img src={current} />
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
          onClose(active)
        }}
      />
    </div>
  )
}

const Gallery = ({ pics = [], active: activeImage }) => {
  const [active, setActive] = useState(activeImage)
  const [zoom, setZoom] = useState(false)
  const thumbnails = useRef()
  useEffect(() => {
    setActive(activeImage)
  }, [activeImage])
  useEffect(() => {
    if (!thumbnails || !thumbnails.current) return
    const img = thumbnails.current.querySelector(`img:nth-child(${active + 1})`)
    thumbnails.current.scrollTo({
      left:
        img.offsetLeft -
        thumbnails.current.clientWidth / 2 +
        img.clientWidth / 2,
      behavior: 'smooth'
    })
  }, [thumbnails, active])

  const current = pics[active]
  if (!current) return null

  const backgroundImage = `url(${current})`

  return (
    <div className="gallery">
      {zoom && (
        <Zoom
          pics={pics}
          initialActive={active}
          onClose={lastActive => {
            setZoom(false)
            setActive(lastActive)
          }}
        />
      )}
      <div
        className="main-pic"
        style={{ backgroundImage }}
        onClick={() => setZoom(true)}
      >
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
      </div>
      {pics.length === 1 ? null : (
        <div className="thumbnails" ref={thumbnails}>
          <div className="inner">
            {pics.map((m, idx) => (
              <img
                key={idx}
                src={m}
                onClick={() => setActive(idx)}
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
      width: 100%
      padding-top: 100%
      margin-bottom: 1rem
      cursor: pointer
      position: relative
      background-size: contain
      background-repeat: no-repeat
      background-position: center center
      .prev,.next
        display: block
        position: absolute
        top: 50%
        left: 0
        transform: translateY(-50%)
        width: 80px
        height: 80px
        background: url(images/left-arrow-large.svg) no-repeat center
        background-size: 30px
        opacity: 0
        transition: opacity 0.25s ease
        &.next
          background-image: url(images/right-arrow-large.svg)
          left: auto
          right: 0
      &:hover
        .prev,.next
          opacity: 0.8
          transition: opacity 0.25s ease
          &:hover
            opacity: 1

    .thumbnails
      height: 60px
      overflow-x: scroll
      overflow-y: hidden
      display: flex
      justify-content: center
      .inner
        height: 100%
        display: flex
        min-width: 0
        > img
          height: 100%
          border-radius: 5px
          cursor: pointer
          opacity: 0.6
          transition: opacity 0.1s
          &:not(:last-child)
            margin-right: 0.75rem
          &:hover
            opacity: 0.8
            transition: opacity 0.1s
          &.active
            opacity: 1
            transition: opacity 0.1s

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
