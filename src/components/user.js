import React, { Component } from 'react'
import Review from './review'

import data from '../data'

class User extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const fullName = 'Aure Gimon'
    const description = 'My name is Aure and I like chickens. It’s been a lifelong obsession and I don’t think it’ll ever go away so I hope you’re not turned off by it or anything.'

    return (
      <div className="public-user profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-4 col-md-3 col-lg-2">
              <div className="primary avatar-container">
                <img src="/images/avatar-blue.svg" alt="avatar" />
              </div>
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10">
              <div className="name d-flex">
                <h1>{fullName.length ? fullName : 'Unnamed User'}</h1>
              </div>
              <p>{description.length ? description : 'This is a placeholder description for a user.'}</p>
            </div>
            <div className="col-12 col-sm-4 col-md-3 col-lg-2">
              <div className="verifications-box">
                <h3>Verified Info</h3>
                <div className="service d-flex">
                  <img src="/images/phone-icon-verified.svg" alt="phone verified icon" />
                  <div>Phone</div>
                </div>
                <div className="service d-flex">
                  <img src="/images/email-icon-verified.svg" alt="email verified icon" />
                  <div>Email</div>
                </div>
                <div className="service d-flex">
                  <img src="/images/facebook-icon-verified.svg" alt="Facebook verified icon" />
                  <div>Facebook</div>
                </div>
                <div className="service d-flex">
                  <img src="/images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                  <div>Twitter</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10">
              <div className="reviews">
                <h2>Reviews <span className="review-count">{Number(57).toLocaleString()}</span></h2>
                {data.reviews.map(r => <Review key={r._id} review={r} />)}
                <a href="#" className="reviews-link" onClick={() => alert('To Do')}>Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default User
