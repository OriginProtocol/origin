import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import Identicon from 'components/identicon'
import WalletCard from 'components/wallet-card'

class UserDropdown extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    $(document).on('click', '.identity .dropdown-menu', e => {
      e.stopPropagation()
    })
  }

  render() {
    const { wallet } = this.props

    return (
      <div className="nav-item identity dropdown">
        <a
          className="nav-link active dropdown-toggle"
          id="identityDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="user"
        >
          <Identicon address={wallet.address} />
        </a>
        <div
          className="dropdown-menu dropdown-menu-right"
          aria-labelledby="identityDropdown"
        >
          <div className="triangle-container d-flex justify-content-end">
            <div className="triangle" />
          </div>
          <div className="actual-menu">
            <WalletCard wallet={wallet} withMenus={false} withProfile={true} />
            <Link to="/profile" className="btn edit-profile placehold">
              <FormattedMessage
                id={'user-dropdown.EditProfile'}
                defaultMessage={'Edit Profile'}
              />
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.wallet
  }
}

export default connect(mapStateToProps)(UserDropdown)
