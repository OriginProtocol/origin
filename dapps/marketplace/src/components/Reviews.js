import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import distanceToNow from 'utils/distanceToNow'
import nextPageFactory from 'utils/nextPageFactory'

import StarRating from 'components/StarRating'
import Avatar from 'components/Avatar'
import Link from 'components/Link'
import QueryError from 'components/QueryError'
import LoadingSpinner from 'components/LoadingSpinner'

import query from 'queries/Reviews'
import EthAddress from './EthAddress'

const nextPage = nextPageFactory('marketplace.user.reviews')

const Reviews = ({ id, first = 3, hideWhenZero, hideHeader, seller }) => {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(query, {
    variables: { id, first },
    skip: !id,
    notifyOnNetworkStatusChange: true
  })

  const vars = { id, first, after }

  if (error) {
    return <QueryError error={error} query={query} vars={vars} />
  }
  if (networkStatus <= 2) {
    return null
  }

  const { nodes, pageInfo, totalCount } = get(data, 'marketplace.user.reviews')
  const { hasNextPage, endCursor: after } = pageInfo

  if (hideWhenZero && !totalCount) {
    return null
  }

  return (
    <div className="reviews">
      {!hideHeader && (
        <h3>
          {seller ? (
            <fbt desc="reviews.headingSeller">Reviews about this seller</fbt>
          ) : (
            <fbt desc="reviews.headingUser">Reviews about this user</fbt>
          )}
        </h3>
      )}
      {!nodes.length && (
        <div className="no-reviews">
          {seller ? (
            <fbt desc="reviews.none.seller">
              No reviews available for this seller
            </fbt>
          ) : (
            <fbt desc="reviews.none.user">
              No reviews available for this user
            </fbt>
          )}
        </div>
      )}
      {!!nodes.length &&
        nodes.map((review, idx) => {
          const profile = get(review, 'reviewer.account.identity') || {}
          return (
            <div key={idx} className="review">
              <div className="user-info">
                <div className="avatar-wrap">
                  <Link to={`/user/${review.reviewer.id}`}>
                    <Avatar size="4rem" profile={profile} />
                  </Link>
                </div>
                <div className="user">
                  <div className="top">
                    <div className="name">
                      <Link to={`/user/${review.reviewer.id}`}>
                        {profile.fullName || (
                          <fbt desc="reviews.unamedUser">Unnamed User</fbt>
                        )}
                      </Link>
                    </div>
                    <EthAddress address={review.reviewer.id} short={true} />
                  </div>
                  <div className="info">
                    <div className="purchase">
                      {`Purchased `}
                      <Link to={`/listing/${review.listing.id}`}>
                        {review.listing.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="review-meta">
                <StarRating small={true} active={review.rating} />
                <div className="timestamp">
                  {distanceToNow(review.event.timestamp)}
                </div>
              </div>
              <div className="text">{review.review}</div>
            </div>
          )
        })}
      {hasNextPage ? (
        <a
          href="#more-reviews"
          className="read-more"
          onClick={e => {
            e.preventDefault()
            if (!loading) {
              // readMore(fetchMore, endCursor)
              nextPage(fetchMore, { ...vars, after })
            }
          }}
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <fbt desc="reviews.readMore">Read More</fbt>
              <i className="read-more-caret" />
            </>
          )}
        </a>
      ) : null}
    </div>
  )
}

export default Reviews

require('react-styl')(`
  .reviews
    margin-bottom: 2rem
    h3
      font-family: Poppins
      font-size: 1.5rem
      font-weight: 500
      font-style: normal
      font-stretch: normal
      line-height: 1.42
      letter-spacing: normal
      color: var(--dark)
    .review
      .user-info
        display: flex
        width: 100%
        align-items: flex-start
        .avatar
          margin-right: 1rem
        .user
          min-width: 0
          flex: 1
          margin-top: 0.6rem
          .top
            flex: 1
            min-width: 0
            display: flex
            flex-direction: row
            align-items: baseline
            .name
              font-family: Lato
              font-size: 1.1rem
              font-weight: bold
              font-style: normal
              font-stretch: normal
              line-height: normal
              letter-spacing: normal
              color: var(--dark)
              margin-right: 0.5rem
              overflow: hidden
              text-overflow: ellipsis
              white-space: nowrap
              a
                color: var(--dark)
            .eth-address
              color: var(--steel)
              font-size: 12px
              font-weight: 300
              overflow: hidden
              text-overflow: ellipsis
              white-space: nowrap
              flex: 1
              margin-right: 0.5rem
          .purchase
            flex: 1
            white-space: nowrap
            overflow: hidden
            text-overflow: ellipsis
            font-family: Lato
            font-size: 1rem
            font-weight: 300
            font-style: normal
            font-stretch: normal
            line-height: normal
            letter-spacing: normal
            margin-top: 5px
        .info
          display: flex
          min-width: 0
          flex-direction: row
          justify-content: space-around
          color: var(--steel)
      .review-meta
        display: flex
        justify-content: space-between
        margin-top: 1.5rem
        .timestamp
          font-family: Lato
          font-size: 1rem
          font-weight: 300
          font-style: normal
          font-stretch: normal
          line-height: normal
          letter-spacing: normal
          color: #6f8294
      .text
        margin: 0.5rem 0 3rem 0
        font-family: Lato
        font-size: 1rem
        font-weight: 300
        font-style: normal
        font-stretch: normal
        line-height: 1.5
        letter-spacing: normal
        color: var(--dark)
      &:last-child .text
        margin-bottom: 0
      &:last-of-type .text
        margin-bottom: 1rem

    .read-more
      font-size: 18px
      font-weight: normal
      color: var(--clear-blue)

    .read-more-caret
      display: inline-block
      width: 12px
      height: 12px
      margin-left: 10px
      transform: rotate(180deg)
      background: url(images/caret-blue.svg) no-repeat right
      background-size: 12px

    .no-reviews
      text-align: center
      padding-top: 7rem
      min-width: 5rem
      position: relative
      color: #6a8296
      &:before
        content: ''
        display: inline-block
        height: 5rem
        width: 100%
        position: absolute
        top: 1rem
        left: 0
        right: 0
        background-image: url('images/no-reviews-icon.svg')
        background-repeat: no-repeat
        background-size: contain
        background-position: center

`)
