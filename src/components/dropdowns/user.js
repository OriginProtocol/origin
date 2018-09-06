import React, { Component } from 'react'
import { connect } from 'react-redux'
import $ from 'jquery'

import { getEthBalance, getOgnBalance } from 'actions/Wallet'

import Identicon from 'components/identicon'
import Wallet from 'components/wallet'

class UserDropdown extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.getEthBalance()
    this.props.getOgnBalance()
    $(document).on('click', '.identity .dropdown-menu', e => {
      e.stopPropagation()
    })
  }

  render() {
    const { address, ethBalance, ognBalance } = this.props.wallet

    return (
      <div className="nav-item identity dropdown">
        <a
          className="nav-link active dropdown-toggle"
          id="identityDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <Identicon address={address} />
        </a>
        <div
          className="dropdown-menu dropdown-menu-right"
          aria-labelledby="identityDropdown"
        >
          <div className="triangle-container d-flex justify-content-end">
            <div className="triangle" />
          </div>
          <div className="actual-menu">
            <Wallet address={address} ethBalance={ethBalance} ognBalance={ognBalance} withMenus={false} withProfile={true} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.wallet,
  }
}

const matchDispatchToProps = dispatch => ({
  getEthBalance: () => dispatch(getEthBalance()),
  getOgnBalance: () => dispatch(getOgnBalance())
})

export default connect(mapStateToProps, matchDispatchToProps)(UserDropdown)
