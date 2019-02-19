import React, { Component } from 'react'
import moment from 'moment-timezone'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'
import UnnamedUser from 'components/unnamed-user'

import { formattedAddress } from 'utils/user'

class Review extends Component {
  componentWillMount() {
    this.props.fetchUser(this.props.review.reviewer)
  }

  render() {
    const { review, user } = this.props
    const { rating, text, timestamp } = review
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
              <div className="name">{fullName || <UnnamedUser />}</div>
              <div className="address text-muted text-truncate" title={formattedAddress(address)}>
                {formattedAddress(address)}
              </div>
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
                {moment(createdAt).fromNow()}
              </div>
            </div>
          </div>
        </Link>
        <p className="content">{text}</p>
      </div>
    )
  }
}

const mapStateToProps = (state, { review }) => {
  return {
    user: state.users.find(u => {
      return formattedAddress(u.address) === formattedAddress(review.reviewer)
    }) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Review)
