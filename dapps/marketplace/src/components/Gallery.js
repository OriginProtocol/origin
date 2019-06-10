import React, { Component } from 'react'
import get from 'lodash/get'

class Gallery extends Component {
  state = { active: 0 }
  render() {
    const pics = get(this.props, 'pics') || []
    const active = pics[this.state.active]
    if (!active) return null

    return (
      <div className="gallery">
        <div
          className="main-pic"
          style={{ backgroundImage: `url(${active.urlExpanded})` }}
        />
        {pics.length === 1 ? null : (
          <div className="thumbnails">
            <div className="inner">
              {pics.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => this.setState({ active: idx })}
                  style={{ backgroundImage: `url(${m.urlExpanded})` }}
                  className={this.state.active === idx ? 'active' : ''}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default Gallery

require('react-styl')(`
  .gallery
    display: flex
    flex-direction: column
    .main-pic
      flex: 1
      height: 100%
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
