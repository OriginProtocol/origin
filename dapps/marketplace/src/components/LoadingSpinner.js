import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" />
    </div>
  )
}

export default LoadingSpinner

require('react-styl')(`
  .loading-spinner-container
    background-color: white
    background-size: cover
    width: 4.5em
    height: 4.5em
    position: fixed
    top: calc(50% - 1.5rem)
    left: calc(50% - 1.5rem)
    border-radius: 8px
    box-shadow: 0px 8px 12px 0px lightGray

  .loading-spinner
    background: url(images/spinner-animation-dark.svg) no-repeat center
    background-size: cover
    width: 3em
    height: 3em
    position: relative
    top: 0.75em
    left: 0.75em
`)
