import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import StarRating from 'components/StarRating'
import Avatar from 'components/Avatar'
import ReviewsQuery from 'queries/Reviews'
import EthAddress from './EthAddress'

export default class Reviews extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lastReviewShown: 3
    }
    this.readMore = this.readMore.bind(this)
  }

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
              <h3>{`Reviews ${count}`}</h3>
              {reviews.map((review, idx) => {
                const profile = get(review, 'reviewer.account.identity') || {}
                return (
                  <div
                    key={idx}
                    className={
                      idx < this.state.lastReviewShown
                        ? 'review review-ease-in'
                        : 'hidden-review'
                    }
                  >
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
              {this.state.lastReviewShown < count ? (
                <div className="read-more" onClick={this.readMore}>
                  Read More
                  <img className="read-more-caret" />
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
  .review-ease-in
    animation-name: fadeIn;
    animation-duration: .3s;
    -webkit-transition-duration: .3s;
    transition-duration: .3s
  @keyframes fadeIn
    from
      height: 0px;
      opacity: 0;
    to
      opacity: 1;
  .hidden-review
    visibility: hidden;
    height: 0;
    width: 0;
  .reviews .read-more 
    width: 109px;
    height: 27px;
    font-family: Lato;
    font-size: 18px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.44;
    letter-spacing: normal;
    text-align: left;
    color: var(--clear-blue);
    margin-rigt: 10px;
  .read-more-caret
    width: 12px;
    height: 12px;
    margin-left: 10px;
    transform: rotate(180deg);
    background: url(images/caret-blue.svg) no-repeat right;
    background-size: 12px;
`)
