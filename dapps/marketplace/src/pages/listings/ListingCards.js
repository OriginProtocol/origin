import React, { useState } from 'react'

import Redirect from 'components/Redirect'
import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import ListingBadge from 'components/ListingBadge'
import Category from 'components/Category'
import withGrowthRewards from 'hoc/withGrowthRewards'

function altClick(e) {
  return e.button === 0 && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey
}

const ListingCards = ({ listings, ognListingRewards, hideCategory, horizontalList }) => {
  const [redirect, setRedirect] = useState()
  if (!listings) return null

  return (
    <div className={horizontalList ? 'listing-horizontal-cards' : 'row'}>
      {redirect && <Redirect to={redirect} />}
      {listings.map(a => (
        <div
          key={a.id}
          onClick={e => {
            if (altClick(e)) {
              setRedirect(`/listing/${a.id}`)
            } else if (e.target.tagName !== 'A') {
              window.open(`#/listing/${a.id}`, '_blank')
            }
          }}
          className={`${horizontalList ? '' : 'col-md-4 col-lg-3 '}listing-card`}
        >
          {a.media && a.media.length ? (
            <div
              className="main-pic"
              style={{
                backgroundImage: `url(${a.media[0].urlExpanded})`
              }}
            />
          ) : (
            <div className="main-pic empty" />
          )}
          {hideCategory ? null : (
            <div className="header">
              <div className="category">
                <Category listing={a} showPrimary={false} />
              </div>
              <ListingBadge status={a.status} featured={a.featured} />
            </div>
          )}
          <h5>
            <a href={`#/listing/${a.id}`}>{a.title}</a>
          </h5>
          {a.__typename === 'AnnouncementListing' ? null : (
            <div className="price d-flex align-items-center">
              <Price listing={a} descriptor />
              {ognListingRewards[a.id] && (
                <OgnBadge
                  amount={ognListingRewards[a.id]}
                  className="listing-card-growth-reward"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default withGrowthRewards(ListingCards)

require('react-styl')(`
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
      padding-top: 66.6%
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

  .listing-horizontal-cards
    width: 100%
    overflow-x: scroll
    white-space: nowrap
    .listing-card
      width: 165px
      display: inline-block
      margin: 0.5rem
      .main-pic
        margin-bottom: 0.5rem
        height: 165px

  @media (max-width: 767.98px)
    .listing-horizontal-cards
      text-align: center
      overflow-x: hidden
      white-space: normal
      .listing-card
        max-width: 165px
        display: inline-block
        padding: 0 0.5rem
        text-align: left
        margin: 0.5rem 0

  @media (max-width: 330px)
    // For really small screens (iPhone SE, etc..)
    .listing-horizontal-cards
      text-align: center
      overflow-x: hidden
      white-space: normal
      .listing-card
        max-width: 100%
        width: 100%
`)
