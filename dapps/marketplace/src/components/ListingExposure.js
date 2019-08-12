import React from 'react'
import { fbt } from 'fbt-runtime'

const Exposure = ({ listing }) => {
  let exposure = fbt('None', 'listingExposure.none'),
    className = 'low'
  if (listing.commissionPerUnit >= 15) {
    exposure = fbt('Very High', 'listingExposure.veryHigh')
    className = 'very-high'
  } else if (listing.commissionPerUnit >= 10) {
    exposure = fbt('High', 'listingExposure.high')
    className = 'high'
  } else if (listing.commissionPerUnit >= 5) {
    exposure = fbt('Above Average', 'listingExposure.aboveAverage')
    className = 'medium'
  } else if (listing.commissionPerUnit > 0) {
    exposure = fbt('Low', 'listingExposure.low')
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
