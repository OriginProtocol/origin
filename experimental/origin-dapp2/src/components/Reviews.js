import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import StarRating from 'components/StarRating'
import Avatar from 'components/Avatar'
import ReviewsQuery from 'queries/Reviews'
import EthAddress from './EthAddress'

const Reviews = ({ id }) => (
  <Query query={ReviewsQuery} variables={{ id }}>
    {({ data, loading, error }) => {
      if (loading || error) return null

      const reviews = get(data, 'marketplace.user.reviews.nodes', [])
      const count = get(data, 'marketplace.user.reviews.totalCount', 0)

      return (
        <div className="reviews">
          <h3>{`Reviews ${count}`}</h3>
          {reviews.map((review, idx) => {
            const profile = get(review, 'reviewer.account.identity') || {}
            return (
              <div key={idx} className="review">
                <div className="user-info">
                  <Avatar size="4rem" avatar={profile.avatar} />
                  <div className="user">
                    <div className="name">
                      {profile.fullName || 'Unnamed User'}
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
        </div>
      )
    }}
  </Query>
)

export default Reviews

require('react-styl')(`
  .reviews .review
    .user-info
      display: flex;
      width: 100%;
      justify-content: space-around
      .avatar
        margin-right: 1rem
      .user
        flex: 1
        display: flex;
        flex-direction: column;
        justify-content: center;
        .name
          font-size: 18px
          font-weight: bold
          color: var(--black)
        .eth-address
          color: var(--steel)
      .info
        text-align: right
        color: var(--steel)
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    .text
      margin: 0.5rem 0 3rem 0
    &:last-child .text
      margin-bottom: 0
`)
