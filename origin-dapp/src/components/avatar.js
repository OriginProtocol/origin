import React, { Component } from 'react'
import { getStorageItem } from 'utils/localStorage'

class Avatar extends Component {
  render() {
    const { className, image, placeholderStyle } = this.props
    const rotation = getStorageItem('profilePicRotation', 'rotate(0deg)')

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
