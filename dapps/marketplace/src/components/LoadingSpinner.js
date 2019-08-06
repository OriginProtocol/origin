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
    width: 5em
    height: 5em
    position: fixed
    top: calc(50% - 2.5em)
    left: calc(50% - 2.5em)
    border-radius: 8px
    opacity: 0.9

  .loading-spinner
    background: url(images/spinner-animation-dark.svg) no-repeat center
    background-size: cover
    width: 3em
    height: 3em
    position: relative
    top: 1em
    left: 1em
`)
