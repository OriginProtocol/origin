import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class UserCard extends Component {
  render() {
    const { address, name, title } = this.props.user

    return (
      <div className="user-card placehold">
        <div className="identity">
          <h3>About the {title}</h3>
          <div className="d-flex">
            <div className="image-container">
              <Link to={`/users/${address}`}>
                <img src="/images/identicon.png"
                  srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                  alt="wallet icon" />
              </Link>
            </div>
            <div>
              <div>ETH Address:</div>
              <div className="address"><strong>{address}</strong></div>
            </div>
          </div>
          <hr className="dark sm" />
          <div className="d-flex">
            <div className="avatar-container">
              <img src="/images/avatar-blue.svg" alt="avatar" />
            </div>
            <div className="identification d-flex flex-column justify-content-between">
              <div><Link to={`/users/${address}`}>{name}</Link></div>
              <div>
                <Link to={`/users/${address}`}>
                  <img src="/images/phone-icon-verified.svg" alt="phone verified icon" />
                </Link>
                <Link to={`/users/${address}`}>
                  <img src="/images/email-icon-verified.svg" alt="email verified icon" />
                </Link>
                <Link to={`/users/${address}`}>
                  <img src="/images/facebook-icon-verified.svg" alt="Facebook verified icon" />
                </Link>
                <Link to={`/users/${address}`}>
                  <img src="/images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Link to={`/users/${address}`} className="btn placehold">View Profile</Link>
      </div>
    )
  }
}

export default UserCard
