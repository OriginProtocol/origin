import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import set from 'lodash/set'
import { fbt } from 'fbt-runtime'
import distanceToNow from 'utils/distanceToNow'

import StarRating from 'components/StarRating'
import Avatar from 'components/Avatar'
import Link from 'components/Link'
import QueryError from 'components/QueryError'

import query from 'queries/Reviews'
import EthAddress from './EthAddress'

export default class Reviews extends Component {
  readMore(fetchMore, after) {
    fetchMore({
      variables: {
        after
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }

        if (!prev) {
          return fetchMoreResult
        }

        let updatedData = { ...prev }

        const prevReviews = get(prev, 'marketplace.user.reviews.nodes', [])
        const newReviews = get(
          fetchMoreResult,
          'marketplace.user.reviews.nodes',
          []
        )
        const prevPageInfo = get(prev, 'marketplace.user.reviews.pageInfo', {})
        const pageInfo = get(
          fetchMoreResult,
          'marketplace.user.reviews.pageInfo',
          {}
        )

        updatedData = set(updatedData, 'marketplace.user.reviews.nodes', [
          ...prevReviews,
          ...newReviews
        ])

        updatedData = set(updatedData, 'marketplace.user.reviews.pageInfo', {
          ...prevPageInfo,
          ...pageInfo
        })

        return updatedData
      }
    })
  }

  render() {
    const { id, after } = this.props
    const first = this.props.first || 5

    return (
      <Query query={query} variables={{ id, first, after }}>
        {({ data, loading, error, fetchMore }) => {
          if (error) {
            return (
              <QueryError
                error={error}
                query={query}
                vars={{ id, first, after }}
              />
            )
          }
          if (loading) return null

          const reviews = get(data, 'marketplace.user.reviews.nodes', [])
          const count = get(data, 'marketplace.user.reviews.totalCount', 0)

          const { hasNextPage, endCursor } = get(
            data,
            'marketplace.user.reviews.pageInfo',
            {}
          )

          if (this.props.hideWhenZero && !count) {
            return null
          }

          return (
            <div className="reviews">
              <h3>
                {this.props.seller && (
                  <fbt desc="reviews.headingSeller">Reviews of this seller</fbt>
                )}
                {!this.props.seller && (
                  <fbt desc="reviews.headingUser">Reviews of this user</fbt>
                )}
              </h3>
              {reviews.map((review, idx) => {
                const profile = get(review, 'reviewer.account.identity') || {}
                return (
                  <div key={idx} className="review review-ease-in">
                    <div className="user-info">
                      <div className="avatar-wrap">
                        <Avatar size="4rem" profile={profile} />
                      </div>
                      <div className="user">
                        <div className="top">
                          <div className="name">
                            {profile.fullName || (
                              <fbt desc="reviews.unamedUser">Unnamed User</fbt>
                            )}
                          </div>
                          <EthAddress address={review.reviewer.id} />
                          <StarRating small={true} active={review.rating} />
                        </div>
                        <div className="info">
                          <div className="purchase">
                            {`Purchased `}
                            <Link to={`/listing/${review.listing.id}`}>
                              {review.listing.title}
                            </Link>
                          </div>
                          <div className="time">
                            {distanceToNow(review.event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text">{review.review}</div>
                  </div>
                )
              })}
              {hasNextPage ? (
                <div
                  className="read-more btn"
                  onClick={() => this.readMore(fetchMore, endCursor)}
                >
                  <fbt desc="reviews.readMore">Read More</fbt>
                  <i className="read-more-caret" />
                </div>
              ) : null}
            </div>
          )
        }}
      </Query>
    )
  }
}

require('react-styl')(`
  .reviews
    .review
      .user-info
        display: flex
        width: 100%;
        align-items: flex-start
        .avatar
          margin-right: 1rem
        .user
          min-width: 0
          flex: 1
          .top
            flex: 1
            min-width: 0
            display: flex
            flex-direction: row
            align-items: baseline
            .name
              font-size: 18px
              font-weight: bold
              color: var(--black)
              margin-right: 0.5rem
              overflow: hidden
              text-overflow: ellipsis
              white-space: nowrap
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
            margin-right: 0.5rem
        .info
          display: flex
          min-width: 0
          flex-direction: row
          justify-content: space-around
          color: var(--steel)
      .text
        margin: 0.5rem 0 3rem 0
      &:last-child .text
        margin-bottom: 0
      &.review-ease-in
        animation-name: fadeIn
        animation-duration: .3s
        transition-duration: .3s

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

  @keyframes fadeIn
    from
      opacity: 0
    to
      opacity: 1
`)
