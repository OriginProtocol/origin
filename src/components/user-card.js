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
              <Link to="/profile">
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
            <div className="identification">
              <div>{name}</div>
              <img src="/images/twitter-icon-verified.svg" alt="Twitter verified icon" />
            </div>
          </div>
        </div>
        <Link to={`/users/${address}`} className="btn placehold">View Profile</Link>
      </div>
    )
  }
}

export default UserCard
