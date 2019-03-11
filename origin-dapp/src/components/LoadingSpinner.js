import React from 'react'

const LoadingSpinner = () => <div className="loading-spinner" />

export default LoadingSpinner

require('react-styl')(`
  .loading-spinner
    background: url(images/spinner-animation-dark.svg) no-repeat center
    background-size: cover
    position: fixed
    top: calc(50% - 1.5rem)
    left: calc(50% - 1.5rem)
    width: 3rem
    height: 3rem
`)
