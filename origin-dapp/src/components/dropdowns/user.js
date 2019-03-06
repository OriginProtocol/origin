import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Identicon from 'components/identicon'
import WalletCard from 'components/wallet-card'
import Dropdown from 'components/dropdown'
import origin from '../../services/origin'

class UserDropdown extends Component {
  constructor() {
    super()
    this.state = { open: false }
  }

  toggle() {
    const open = !this.state.open
    this.setState({ open })
  }

  render() {
    const { wallet } = this.props
    const { open } = this.state

    return (
      <Dropdown
        className="nav-item identity"
        open={open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          className="nav-link active dropdown-toggle"
          id="identityDropdown"
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="user_profile_dropdown"
          onClick={() => this.toggle()}
        >
          <Identicon address={wallet.address} />
        </a>
        <div
          className={`dropdown-menu dropdown-menu-right${open ? ' show' : ''}`}
          aria-labelledby="identityDropdown"
          onClick={e => {
            if (e.target.nodeName === 'A') this.setState({ open: false })
          }}
        >
          <div className="triangle-container justify-content-end d-none d-lg-flex">
            <div className="triangle" />
          </div>
          <div className="actual-menu">
            <WalletCard {...wallet} withMenus={false} withProfile={true} />
            {
              origin.contractService.walletLinker &&
              origin.contractService.walletLinker.linked &&
                <Link to="#"
                  className="btn edit-profile placehold"
                  onClick={()=>{origin.contractService.walletLinker.unlink(); return false}}>
                  <FormattedMessage
                    id={'user-dropdown.UnlinkMobile'}
                    defaultMessage ={'Unlink Mobile'}
                  />
                </Link>
            }
            <Link to="/profile" className="btn edit-profile placehold" onClick={this.handleClick}>
              <FormattedMessage
                id={'user-dropdown.EditProfile'}
                defaultMessage={'Edit Profile'}
              />
            </Link>
          </div>
        </div>
      </Dropdown>
    )
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.wallet
  }
}

export default connect(mapStateToProps)(UserDropdown)
