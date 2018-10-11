import React, { Component } from 'react'

class Avatar extends Component {
  render() {
    const { className, image, placeholderStyle } = this.props

    return image ? (
      <div
        className={`${className ? `${className} ` : ''}avatar-container`}
        style={{ backgroundImage: `url(${image})` }}
      />
    ) : (
      <div
        className={`${
          className ? `${className} ` : ''
        }placeholder avatar-container`}
      >
        <img
          src={`images/avatar-${placeholderStyle}.svg`}
          role="presentation"
        />
      </div>
    )
  }
}

export default Avatar
