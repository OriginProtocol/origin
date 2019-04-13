import React from 'react'

const Avatar = ({ size, avatar, className, emptyClass = 'empty' }) => {
  const props = { style: {}, className: 'avatar' }
  if (size) {
    props.style = { width: size || 50, paddingTop: size || 50 }
  }

  if (!avatar) {
    props.className += ` ${emptyClass}`
  } else {
    props.style.backgroundImage = `url(${avatar})`
  }

  if (className) {
    props.className += ` ${className}`
  }

  return <div {...props} />
}

export default Avatar

require('react-styl')(`
  .avatar
    position: relative
    width: 100%
    padding-top: 100%
    background-size: contain
    border-radius: var(--default-radius)
    background-repeat: no-repeat
    background-position: center

    &.empty
      background: var(--dark-grey-blue) url(images/avatar-blue.svg) no-repeat center bottom;
      background-size: 63%
      &.dark
        background: var(--dark-two) url(images/avatar-unnamed.svg) no-repeat center bottom;
        background-size: 63%
    &.camera
      background: var(--dark-two) url(images/camera-icon.svg) no-repeat center;
    &.with-cam::after
      content: ""
      width: 2rem
      height: 2rem
      background: url(images/camera-icon-circle.svg) no-repeat center
      background-size: 100%
      position: absolute
      bottom: 0.3rem
      right: 0.3rem

`)
