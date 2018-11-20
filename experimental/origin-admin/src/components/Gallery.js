import React, { Component } from 'react'
import { getIpfsGateway } from 'utils/config'

class Gallery extends Component {
  state = { active: 0 }
  render() {
    const { pics } = this.props
    const active = pics[this.state.active]
    const ipfsGateway = getIpfsGateway()
    if (!active) return null
    return (
      <div className="gallery">
        <div
          className="main-pic"
          style={{
            backgroundImage: `url(${ipfsGateway}/${active.url.replace(
              ':/',
              ''
            )})`
          }}
        />
        {pics.length === 1 ? null : (
          <div className="thumbnails">
            {pics.map((m, idx) => (
              <img
                key={idx}
                onClick={() => this.setState({ active: idx })}
                src={`${ipfsGateway}/${m.url.replace(':/', '')}`}
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
    .main-pic
      height: 200px
      background-size: contain
      background-repeat: no-repeat
      background-position: center
      margin-bottom: 2px
    .thumbnails
      overflow-x: auto
      width: 100%
      white-space: nowrap
      img
        max-height: 80px
        cursor: pointer
        border-width: 2px
        border-style: solid
        border-color: #fff
        opacity: 0.75
        &:hover
          opacity: 1
        &.active
          border-color: #ff6
          opacity: 1

`)
