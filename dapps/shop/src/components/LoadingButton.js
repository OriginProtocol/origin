import React from 'react'

const LoadingButton = ({ loading, className, children, ...props }) => (
  <button
    className={`btn-loading ${className || ''}${loading ? ' loading' : ''}`}
    {...props}
  >
    <span className="btn-content">{children}</span>
  </button>
)

export default LoadingButton

require('react-styl')(`
  @keyframes spin
    0%
      transform: rotate(0deg)
    100%
      transform: rotate(359deg)
  .btn-loading
    position: relative
    &.loading
      .btn-content
        visibility: hidden
      &:before
        content: ""
        background-image: url(images/spinner.svg)
        background-repeat: no-repeat
        background-size: 20%
        background-position: center
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        animation: spin 1.2s linear infinite

`)
