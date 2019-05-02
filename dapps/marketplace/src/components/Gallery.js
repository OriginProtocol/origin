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
        overflow-x:scroll;
        overflow-y:hidden;
        white-space:nowrap;
        > div:first-child
          padding: 5px 5px 5px 0
        > div:last-child
          padding: 5px 0 5px 5px
        > div
          width: 100px
          height: 100%
          display: inline-block
          margin-bottom: 5px
          padding: 5px
          background-position: center
          background-repeat: no-repeat
          background-size: contain
          background-origin: content-box
          cursor: pointer
          opacity: 0.75
          &:hover
            opacity: 1
          &.active
            box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.5)
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
