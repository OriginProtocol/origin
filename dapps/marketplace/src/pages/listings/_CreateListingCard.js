import React from 'react'

import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const CreateListingCard = () => (
  <div className="listing-card create-listing-card">
    <Link to="/create">
      <div className="main-pic">
        <div>
          <fbt desc="listingCard.yourListing">Your listing here</fbt>
        </div>
      </div>
    </Link>
    <div className="placeholder" />
  </div>
)

export default CreateListingCard

require('react-styl')(`
  .listing-card.create-listing-card
    .main-pic
      text-align: center
      border: dashed 1px #c0cbd4
      position: relative
      font-size: 14px
      color: #0d1d29
      > div
        position: absolute
        left: 50%
        top: 50%
        transform: translate(-50%, -50%)
        white-space: nowrap
        &:before
          content: ''
          display: block
          background-image: url('images/growth/blue-add-icon.svg')
          background-position: top center
          background-size: 2.25rem
          background-repeat: no-repeat
          height: 2.25rem
          margin-bottom: 0.6rem
    .placeholder
      margin-top: 0.5rem
      line-height: 1
      &:before
        content: ''
        display: inline-block
        width: 81.25%
        height: 10px
        background-color: #eaf0f3
      &:after
        content: ''
        display: inline-block
        width: 28%
        height: 10px
        background-color: #eaf0f3
`)
