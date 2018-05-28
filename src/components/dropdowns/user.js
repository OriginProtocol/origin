import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'

import Avatar from 'components/avatar'
import Identicon from 'components/Identicon'

class UserDropdown extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { profile, wallet } = this.props
    const { user } = profile

    return (
      <div className="nav-item identity dropdown">
        <a className="nav-link active dropdown-toggle" id="identityDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <Identicon address={wallet.address} />
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="identityDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <div className="wallet">
              <div className="d-flex">
                <div className="image-container">
                  <Link to="/profile">
                    <Identicon address={wallet.address} size={50} />
                  </Link>
                </div>
                <div className="eth d-flex flex-column justify-content-between">
                  {wallet.address && <div>ETH Address:</div>}
                  <Link to="/profile"><strong>{wallet.address || 'No ETH Account Connected'}</strong></Link>
                </div>
              </div>
              <hr className="dark sm" />
              <div className="d-flex">
                <Link to="/profile">
                  <Avatar image={user && user.profile && user.profile.avatar} placeholderStyle="blue" />
                </Link>
                <div className="identification d-flex flex-column justify-content-between">
                  <div><Link to="/profile">{profile.name}</Link></div>
                  <div>
                    {profile.published.phone &&
                      <Link to="/profile">
                        <img src="images/phone-icon-verified.svg" alt="phone verified icon" />
                      </Link>
                    }
                    {profile.published.email &&
                      <Link to="/profile">
                        <img src="images/email-icon-verified.svg" alt="email verified icon" />
                      </Link>
                    }
                    {profile.published.facebook &&
                      <Link to="/profile">
                        <img src="images/facebook-icon-verified.svg" alt="Facebook verified icon" />
                      </Link>
                    }
                    {profile.published.twitter &&
                      <Link to="/profile">
                        <img src="images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                      </Link>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.wallet,
    profile: state.profile,
  }
}

export default connect(mapStateToProps)(UserDropdown)
