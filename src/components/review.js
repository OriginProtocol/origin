import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUser } from 'actions/User'
import Timelapse from './timelapse'

class Review extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.fetchUser(this.props.review.reviewerAddress)
  }

  render() {
    const { review, user } = this.props
    const { rating, reviewText, timestamp } = review
    const { address, profile } = user
    const fullName = (profile && `${profile.firstName} ${profile.lastName}`) || 'Unnamed User'
    const createdAt = timestamp * 1000 // convert seconds since epoch to ms

    return (
      <div className="review">
        <Link to={`users/${address}`}>
          <div className="d-flex">
            <div className="avatar-container">
              <img src="images/avatar-purple.svg" alt="reviewer avatar" />
            </div>
            <div className="identification d-flex flex-column justify-content-center text-truncate">
              <div className="name">{fullName}</div>
              <div className="address text-muted text-truncate">{address}</div>
            </div>
            <div className="rating d-flex flex-column justify-content-center text-right">
              <div className="stars">{[...Array(5)].map((undef, i) => {
                return (
                  <img
                    key={`rating-star-${i}`}
                    src={`/images/star-${rating > i ? 'filled' : 'empty'}.svg`}
                    alt="review rating star"
                  />
                )
              })}</div>
              <div className="age text-muted"><Timelapse reactive={false} reference={new Date(createdAt)} /></div>
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
    user: state.users.find(u => u.address === review.reviewerAddress) || {},
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(Review)
