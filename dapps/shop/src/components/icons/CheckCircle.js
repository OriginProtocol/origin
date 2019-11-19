import React from 'react'

const CheckCircle = () => (
  <svg className="icon icon-check-circle" viewBox="0 0 50 50" fill="none">
    <path d="M25 49c13.255 0 24-10.745 24-24S38.255 1 25 1 1 11.745 1 25s10.745 24 24 24z" />
    <path d="M15 24.51l7.307 7.308L35.125 19" />
  </svg>
)

export default CheckCircle

require('react-styl')(`
  .icon.icon-check-circle
    path
      stroke: #1990c6
      stroke-width: 2
`)
