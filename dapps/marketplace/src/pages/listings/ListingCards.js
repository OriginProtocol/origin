import React, { useState } from 'react'

import Redirect from 'components/Redirect'
import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import ListingBadge from 'components/ListingBadge'
import Category from 'components/Category'
import withGrowthRewards from 'hoc/withGrowthRewards'

import EarnTokensListing from './_EarnTokensCard'
import CreateListingCard from './_CreateListingCard'

function altClick(e) {
  return e.button === 0 && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey
}

const ListingCards = ({
  listings,
  ognListingRewards,
  hideCategory,
  horizontal,
  compact,
  injectCTAs
}) => {
  const [redirect, setRedirect] = useState()
  if (!listings) return null

  const listingToRender = injectCTAs
    ? [
        ...listings.slice(0, 2),
        { id: 'earn-tokens-card' },
        ...listings.slice(2, 4),
        { id: 'create-listing-card' },
        ...listings.slice(4)
      ]
    : listings

  return (
    <div
      className={`listing-cards${
        horizontal ? ' listing-horizontal-cards' : ''
      }${compact ? ' listing-compact-cards' : ''}`}
    >
      {redirect && <Redirect to={redirect} push />}
      {listingToRender.map(listing => {
        if (listing.id === 'create-listing-card') {
          return <CreateListingCard key={listing.id} />
        } else if (listing.id === 'earn-tokens-card') {
          return <EarnTokensListing key={listing.id} />
        }

        return (
          <div
            key={listing.id}
            onClick={e => {
              if (altClick(e)) {
                setRedirect(`/listing/${listing.id}`)
              } else if (e.target.tagName !== 'A') {
                window.open(`#/listing/${listing.id}`, '_blank')
              }
            }}
            className="listing-card"
          >
            {listing.media && listing.media.length ? (
              <div
                className="main-pic"
                style={{
                  backgroundImage: `url(${listing.media[0].urlExpanded})`
                }}
              />
            ) : (
              <div className="main-pic empty" />
            )}
            {hideCategory ? null : (
              <div className="header">
                <div className="category">
                  <Category listing={listing} showPrimary={false} />
                </div>
                <ListingBadge
                  status={listing.status}
                  featured={listing.featured}
                />
              </div>
            )}
            <h5>
              <a href={`#/listing/${listing.id}`}>{listing.title}</a>
            </h5>
            {listing.__typename === 'AnnouncementListing' ? null : (
              <div className="price d-flex align-items-center">
                <Price listing={listing} descriptor />
                {ognListingRewards[listing.id] && (
                  <OgnBadge
                    amount={ognListingRewards[listing.id]}
                    className="listing-card-growth-reward"
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default withGrowthRewards(ListingCards)

require('react-styl')(`
  .listing-cards
    display: grid
    grid-column-gap: 1.5rem
    grid-row-gap: 1.5rem
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr))

    &.listing-horizontal-cards
      display: inline-flex
      overflow-x: scroll
      width: 100%
      flex-wrap: nowrap
      .listing-card
        margin-right: 1.5rem
        width: 170px
        flex: auto 0 0
        .main-pic
          height: 170px

    &.listing-compact-cards
      display: flex
      flex-direction: column
      .listing-card
        position: relative
        padding-left: 7rem
        min-height: 6rem
        margin-bottom: 0.75rem
        margin-top: 0
        h5
          margin-bottom: 5px
          font-weight: normal
          font-size: 16px
        .main-pic
          height: 6rem
          width: 6rem
          padding: 0
          left: 0
          position: absolute
        .price
          font-size: 15px
          font-weight: normal

  .listing-card
    position: relative
    overflow: hidden
    display: flex
    flex-direction: column
    justify-content: flex-start
    margin-bottom: 1rem
    margin-top: 1rem
    cursor: pointer

    .main-pic
      padding-top: 75%
      background-size: cover
      background-repeat: no-repeat
      background-position: center
      border-radius: 10px
      &.empty
        background: var(--light) url(images/default-image.svg)
        background-repeat: no-repeat
        background-position: center

    .header
      display: flex
      align-items: center
      justify-content: space-between

    .category
      font-family: var(--default-font)
      font-size: 12px
      color: var(--dusk)
      text-transform: uppercase
      margin-top: 0.75rem
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
      font-weight: normal

    .badge
      margin-top: 0.75rem

    h5
      font-family: var(--heading-font)
      font-size: 16px
      font-weight: normal
      color: var(--dark)
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
      margin: 0.25rem 0
      line-height: 1.5
      a
        color: var(--dark)

    .price
      font-family: var(--default-font)
      font-size: 16px
      color: var(--dark)
      font-weight: bold
      line-height: 1
      justify-content: space-between
      span.desc
        color: var(--steel)
        font-size: 14px
        font-weight: normal
        margin-left: 0.25rem
        margin-bottom: 0.12rem

  @media (max-width: 767.98px)
    .listing-cards
      grid-template-columns: repeat(auto-fill,minmax(135px, 1fr))
      grid-column-gap: 1rem
      grid-row-gap: 1rem
    .listing-card
      .category
        display: none
      h5
        margin: 0.5rem 0 0 0
        font-size: 14px
      .price
        font-size: 12px
        span.desc
          font-size: 10px
        .growth-reward-amount
          .earn
            font-size: 11px
          img
            width: 11px
            height: 11px
          .ogn
            font-size: 11px
            padding-left: 0.125rem
`)
