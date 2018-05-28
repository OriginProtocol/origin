import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUser } from 'actions/User'
import Avatar from './avatar'
import EtherscanLink from './etherscan-link'

class UserCard extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.fetchUser(this.props.userAddress)
  }

  render() {
    const { title, user, userAddress } = this.props
    const { fullName, profile, attestations } = user

    return (
      <div className="user-card placehold">
        <div className="identity">
          <h3>About the {title}</h3>
          <div className="d-flex">
            <div className="image-container">
              <Link to={`/users/${userAddress}`}>
                <img src="images/identicon.png"
                  srcSet="images/identicon@2x.png 2x, images/identicon@3x.png 3x"
                  alt="wallet icon" />
              </Link>
            </div>
            <div>
              <div>ETH Address:</div>
              <div className="address">{userAddress && <EtherscanLink hash={userAddress} />}</div>
            </div>
          </div>
          <hr className="dark sm" />
          <div className="d-flex">
            <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
            <div className="identification d-flex flex-column justify-content-between">
              <div><Link to={`/users/${userAddress}`}>{fullName}</Link></div>
              {attestations && !!attestations.length &&
                <div>
                  {attestations.find(a => a.service === 'phone') &&
                    <Link to={`/users/${userAddress}`}>
                      <img src="images/phone-icon-verified.svg" alt="phone verified icon" />
                    </Link>
                  }
                  {attestations.find(a => a.service === 'email') &&
                    <Link to={`/users/${userAddress}`}>
                      <img src="images/email-icon-verified.svg" alt="email verified icon" />
                    </Link>
                  }
                  {attestations.find(a => a.service === 'facebook') &&
                    <Link to={`/users/${userAddress}`}>
                      <img src="images/facebook-icon-verified.svg" alt="Facebook verified icon" />
                    </Link>
                  }
                  {attestations.find(a => a.service === 'twitter') &&
                    <Link to={`/users/${userAddress}`}>
                      <img src="images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                    </Link>
                  }
                </div>
              }
            </div>
          </div>
        </div>
        <Link to={`/users/${userAddress}`} className="btn placehold">View Profile</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserCard)
