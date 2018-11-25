import React, { Component } from 'react'

class Avatar extends Component {
  render() {
    const { className, image, placeholderStyle, rotation = 'rotate(0deg)'} = this.props

    return image ? (
      <div
        className={`${className ? `${className} ` : ''}avatar-container`}
        style={{ backgroundImage: `url(${image})`, transform: rotation }}
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
