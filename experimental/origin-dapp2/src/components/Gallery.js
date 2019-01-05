import React, { Component } from 'react'

class Gallery extends Component {
  state = { active: 0 }
  render() {
    const { pics } = this.props
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
            {pics.map((m, idx) => (
              <div
                key={idx}
                onClick={() => this.setState({ active: idx })}
                style={{ backgroundImage: `url(${m.urlExpanded})` }}
                className={this.state.active === idx ? 'active' : ''}
              />
            ))}
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
    flex-direction: row
    .main-pic
      flex: 1
    .thumbnails
      display: flex
      flex-direction: column
      width: 100px
      margin-left: 1rem
      > div
        height: 70px
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

`)
