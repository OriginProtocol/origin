import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import StarRating from 'components/StarRating'
import Avatar from 'components/Avatar'
import ReviewsQuery from 'queries/Reviews'
import EthAddress from './EthAddress'

export default class Reviews extends Component {
  state = { lastReviewShown: 3 }

  readMore() {
    this.setState({ lastReviewShown: this.state.lastReviewShown + 1 })
  }

  render() {
    const id = this.props.id
    return (
      <Query query={ReviewsQuery} variables={{ id }}>
        {({ data, loading, error }) => {
          if (loading || error) return null

          const reviews = get(data, 'marketplace.user.reviews.nodes', [])
          const count = get(data, 'marketplace.user.reviews.totalCount', 0)

          return (
            <div className="reviews">
              <h3>
                <fbt desc="reviews.heading">
                  <fbt:plural count={count} showCount="yes">
                    Review
                  </fbt:plural>
                </fbt>
              </h3>
              {reviews.map((review, idx) => {
                const profile = get(review, 'reviewer.account.identity') || {}
                return (
                  <div
                    key={idx}
                    className={
                      idx < this.state.lastReviewShown
                        ? 'review review-ease-in'
                        : 'd-none'
                    }
                  >
                    <div className="user-info">
                      <Avatar size="4rem" avatar={profile.avatar} />
                      <div className="user">
                        <div className="name">
                          {profile.fullName || (
                            <fbt desc="reviews.unamedUser">Unnamed User</fbt>
                          )}
                        </div>
                        <EthAddress address={review.reviewer.id} />
                      </div>
                      <div className="info">
                        <StarRating small={true} active={review.rating} />
                        <div className="time">2d</div>
                      </div>
                    </div>
                    <div className="text">{review.review}</div>
                  </div>
                )
              })}
              {this.state.lastReviewShown < count ? (
                <div className="read-more btn" onClick={() => this.readMore()}>
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
        justify-content: space-around
        .avatar
          margin-right: 1rem
        .user
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          .name
            font-size: 18px
            font-weight: bold
            color: var(--black)
          .eth-address
            color: var(--steel)
        .info
          text-align: right
          color: var(--steel)
          display: flex
          flex-direction: column
          justify-content: space-around
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
