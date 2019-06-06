import React from 'react'
import makeGatewayUrl from 'utils/makeGatewayUrl'
import withConfig from 'hoc/withConfig'

const Avatar = ({
  size,
  avatar,
  avatarUrl,
  avatarUrlExpanded,
  profile,
  config,
  className,
  emptyClass = 'empty'
}) => {
  const props = { style: {}, className: 'avatar' }
  if (size) {
    props.style = { width: size || 50, paddingTop: size || 50 }
  }
  let httpAvatar = undefined

  // If we have a profile, use its avatarUrl and avatarUrlExpanded if needed
  if (profile) {
    avatarUrl = avatarUrl || profile.avatarUrl
    avatarUrlExpanded = avatarUrlExpanded || profile.avatarUrlExpanded
  }

  // Try expanded url first, since we don't have to wait to get a config object
  if (avatarUrlExpanded) {
    httpAvatar = avatarUrlExpanded
  } else if (avatarUrl && config) {
    const { ipfsGateway } = config
    httpAvatar = makeGatewayUrl(ipfsGateway, avatarUrl)
  } else if (avatar) {
    httpAvatar = avatar
  }

  if (!httpAvatar) {
    props.className += ` ${emptyClass}`
  } else {
    props.style.backgroundImage = `url(${httpAvatar})`
  }

  if (className) {
    props.className += ` ${className}`
  }

  return <div {...props} />
}

export default withConfig(Avatar)

require('react-styl')(`
  .avatar
    position: relative
    min-width: 25px
    width: 100%
    padding-top: 100%
    background-size: contain
    border-radius: 50%
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
