import React from 'react'

const Exposure = ({ listing }) => {
  let exposure = 'None',
    className = 'low'
  if (listing.commissionPerUnit >= 15) {
    exposure = 'Very High'
    className = 'very-high'
  } else if (listing.commissionPerUnit >= 10) {
    exposure = 'High'
    className = 'high'
  } else if (listing.commissionPerUnit >= 5) {
    exposure = 'Above Average'
    className = 'medium'
  } else if (listing.commissionPerUnit > 0) {
    exposure = 'Low'
    className = 'low'
  }
  return <span className={`badge exposure-${className}`}>{exposure}</span>
}

export default Exposure

require('react-styl')(`
  .badge
    &.exposure-low,
    &.exposure-high,
    &.exposure-medium,
    &.exposure-very-high
      color: #fff
      background-color: #fec100
    &.exposure-high
      background-color: #9bc845
    &.exposure-very-high
      background-color: #00d693
`)
