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
    width: 4em
    height: 4em
    position: fixed
    top: calc(50% - 2em)
    left: calc(50% - 2em)
    border-radius: 8px

  .loading-spinner
    background: url(images/spinner-animation-dark.svg) no-repeat center
    background-size: cover
    width: 3em
    height: 3em
    position: relative
    top: 0.5em
    left: 0.5em
`)
