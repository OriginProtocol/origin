import React from 'react'
import { Link } from 'react-router-dom'
import Overlay from './overlay'
import PropTypes from 'prop-types'


function NetworkCheck(props, context) {
  const web3Context = context.web3
  /**
   * web3Context = {
   *   accounts: {Array<string>} - All accounts
   *   selectedAccount: {string} - Default ETH account address (coinbase)
   *   network: {string} - One of 'MAINNET', 'ROPSTEN', or 'UNKNOWN'
   *   networkId: {string} - The network ID (e.g. '1' for main net)
   * }
   */
  if ((window.location.hostname === "demo.originprotocol.com") &&
    (parseInt(web3Context.networkId, 10) !== 4)) {
    return (
      <Overlay imageUrl="/images/flat_cross_icon.svg">
        MetaMask should be on <strong>Rinkeby Network</strong><br />
        { !web3Context.networkId ?
          "" :
          web3Context.networkId.toString() === "1" ?
          "Currently on Main Network." :
          `Currently on network ${web3Context.networkId}.`
        }
      </Overlay>
    )
  }
  else return null
}

NetworkCheck.contextTypes = {
  web3: PropTypes.object
}

const NavBar = (props) => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/">
          <div className="logo-container">
            <img src="/images/origin-logo.png"
              srcSet="/images/origin-logo@2x.png 2x, /images/origin-logo@3x.png 3x"
              className="origin-logo" alt="Origin Protocol" />
          </div>
        </Link>
        <NetworkCheck />
        {!props.hideCreateButton &&
          <div className="navbar-create">
            <Link to="/create">
              Create Listing
            </Link>
          </div>
        }
      </div>
    </nav>
  )
}

export default NavBar
export { NetworkCheck }
