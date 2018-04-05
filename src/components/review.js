import React, { Component } from 'react'
import Timelapse from './timelapse'

class Review extends Component {
  render() {
    const { content, createdAt, reviewer, score } = this.props.review

    return (
      <div className="review">
        <div className="d-flex">
          <div className="avatar-container">
            <img src="/images/avatar-purple.svg" alt="reviewer avatar" />
          </div>
          <div className="identification d-flex flex-column justify-content-center">
            <p className="name">{reviewer.name}</p>
            <p className="address">{reviewer.address}</p>
          </div>
          <div className="score d-flex flex-column justify-content-center text-right">
            <div className="stars">{[...Array(5)].map((undef, i) => {
              return (
                <img src={`/images/star-${score > i ? 'filled' : 'empty'}.svg`} alt="review score star" />
              )
            })}</div>
            <p className="age"><Timelapse reference={createdAt} /></p>
          </div>
        </div>
        <p className="content">{content}</p>
      </div>
    )
  }
}

export default Review
