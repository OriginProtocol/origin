import React, { Component } from 'react'
import moment from 'moment'
import { defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'

class Review extends Component {
  constructor(props) {
    super(props)

    this.state = {
      createdAtTime: null
    }

    this.setCreatedAtTime = this.setCreatedAtTime.bind(this)

    this.intlMessages = defineMessages({
      unnamedUser: {
        id: 'review.unnamedUser',
        defaultMessage: 'Unnamed User'
      }
    })
  }

  componentWillMount() {
    this.props.fetchUser(
      this.props.review.reviewerAddress,
      this.props.intl.formatMessage(this.intlMessages.unnamedUser)
    )
  }

  setCreatedAtTime(createdAt) {
    this.setState({
      createdAtTime: moment(createdAt).fromNow()
    })
  }

  render() {
    const { review, user } = this.props
    const { rating, reviewText, timestamp } = review
    const { address, fullName, profile } = user
    const createdAt = timestamp * 1000 // convert seconds since epoch to ms

    return (
      <div className="review">
        <Link to={`/users/${address}`}>
          <div className="d-flex">
            <Avatar
              image={profile && profile.avatar}
              placeholderStyle="purple"
            />
            <div className="identification d-flex flex-column justify-content-center text-truncate">
              <div className="name">{fullName}</div>
              <div className="address text-muted text-truncate">{address}</div>
            </div>
            <div className="rating d-flex flex-column justify-content-center text-right">
              <div className="stars">
                {[...Array(5)].map((undef, i) => {
                  return (
                    <img
                      key={`rating-star-${i}`}
                      src={`/images/star-${
                        rating > i ? 'filled' : 'empty'
                      }.svg`}
                      alt="review rating star"
                    />
                  )
                })}
              </div>
              <div className="age text-muted">
                {this.state.createdAtTime || this.setCreatedAtTime(createdAt)}
              </div>
            </div>
          </div>
        </Link>
        <p className="content">{reviewText}</p>
      </div>
    )
  }
}

const mapStateToProps = (state, { review }) => {
  return {
    user: state.users.find(u => u.address === review.reviewerAddress) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: (addr, msg) => dispatch(fetchUser(addr, msg))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Review))
