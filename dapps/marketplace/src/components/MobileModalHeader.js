import React from 'react'

function MobileModalHeader({
  children,
  headerImageUrl,
  className = '',
  showBackButton,
  showCloseButton,
  onBack,
  fullscreen
}) {
  if (!children && !headerImageUrl) {
    return null
  } else if (!children) {
    return (
      <div
        className={`modal-header ${fullscreen ? 'contained' : ''} image-only${
          className ? ' ' + className : ''
        }`}
      >
        <img src={headerImageUrl} />
      </div>
    )
  }

  let headerClassList = ['modal-header']
  let headerStyle

  if (headerImageUrl) {
    headerClassList.push('with-image')
    headerStyle = { backgroundImage: `url(${headerImageUrl})` }
  }

  if (className) {
    headerClassList = headerClassList.concat(className.split(' '))
  }

  showBackButton = showBackButton !== false // True by default or if unset

  let closeButton

  if (showCloseButton || showBackButton) {
    closeButton = (
      <a
        className={`modal-action-button${
          showCloseButton ? ' close-button' : ' back-button'
        }`}
        onClick={onBack}
      />
    )
  }

  return (
    <div className={`${headerClassList.join(' ')}`} style={headerStyle}>
      {showCloseButton ? <span className="modal-action-button" /> : closeButton}
      <h3 className="modal-title">{children}</h3>
      {showCloseButton ? closeButton : <span className="modal-action-button" />}
    </div>
  )
}

export default MobileModalHeader

require('react-styl')(`
  .mobile-modal-light.contained
    .modal-header
      max-width: 400px
      margin: 0 auto
  .modal-header
    flex-grow: 0
    flex-shrink: 0
    display: flex
    border-bottom: 0
    border-radius: 0
    width: 100%
    &.image-only
      width: 100%
      max-height: 175px
      padding: 0
      img
        width: 100%
    &.with-image
      height: 200px
      background-size: cover
      background-repeat: no-repeat
    .modal-action-button
      flex: 2rem 0 0
      cursor: pointer
      height: 2rem
      &.back-button
        background-image: url('images/caret-grey.svg')
        background-size: 1.5rem
        background-position: top center
        transform: rotateZ(270deg)
        background-repeat: no-repeat
      &.close-button
        background-image: url('images/close-icon.svg')
        background-size: 1.5rem
        background-position: top center
        transform: rotateZ(270deg)
        background-repeat: no-repeat
    .modal-title
      flex: auto
      white-space: nowrap
      text-align: center
      font-family: Poppins
      font-size: 24px
      font-weight: 500
      color: var(--dark-grey-blue)
`)
