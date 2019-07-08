import React from 'react'

import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const CreateListingCard = () => {
  return (
    <div className="create-listing-card">
      <Link to="/create">
        <div className="header">
          <h5>
            <fbt desc="listingCard.yourListing">Your listing here</fbt>
          </h5>
        </div>
      </Link>
      <div className="placeholder" />
    </div>
  )
}

export default CreateListingCard

require('react-styl')(`
  .create-listing-card
    .header
      text-align: center
      border-radius: 10px
      border: dashed 1px #c0cbd4
      margin: 1rem 0
      padding-top: 75%
      position: relative
      h5
        position: absolute
        top: 50%
        left: 0
        right: 0
        transform: translateY(-50%)
        font-size: 14px
        margin: auto 0
        color: #0d1d29
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
