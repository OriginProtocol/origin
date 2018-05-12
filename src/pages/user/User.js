import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchUser } from 'actions/User'
import Review from 'components/review'

import data from '../../data'

class User extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.fetchUser(this.props.userAddress)
  }

  render() {
    const { profile, attestations } = this.props.user
    const claims = profile && profile.claims
    const fullName = (claims && claims.name) || 'Unnamed User'
    const customFields = claims && claims.customFields
    const description = (customFields && customFields.find(f => f.field === 'description')) ||
                        { value: 'An Origin user without a description' }

    return (
      <div className="public-user profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-4 col-md-3 col-lg-2">
              <div className="primary avatar-container">
                <img src="images/avatar-blue.svg" alt="avatar" />
              </div>
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10">
              <div className="name d-flex">
                <h1>{fullName}</h1>
              </div>
              <p>{description.value}</p>
            </div>
            <div className="col-12 col-sm-4 col-md-3 col-lg-2">
              {attestations && !!attestations.length &&
                <div className="verifications-box">
                  <h3>Verified Info</h3>
                  {/* need to know how to verify signature instead of just finding object by key */}
                  {attestations.find(a => a.service === 'phone') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="phone verified icon" />
                      <div>Phone</div>
                    </div>
                  }
                  {attestations.find(a => a.service === 'email') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="email verified icon" />
                      <div>Email</div>
                    </div>
                  }
                  {attestations.find(a => a.service === 'facebook') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="Facebook verified icon" />
                      <div>Facebook</div>
                    </div>
                  }
                  {attestations.find(a => a.service === 'twitter') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="Twitter verified icon" />
                      <div>Twitter</div>
                    </div>
                  }
                </div>
              }
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10">
              <div className="reviews">
                <h2>Reviews <span className="review-count">{Number(57).toLocaleString()}</span></h2>
                {data.reviews.map(r => <Review key={r._id} review={r} />)}
                <a href="#" className="reviews-link" onClick={() => alert('To Do')}>Read More<img src="images/carat-blue.svg" className="down carat" alt="down carat" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { userAddress }) => {
  return {
    user: state.users.find(u => u.address === userAddress) || {},
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(User)
