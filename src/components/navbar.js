import React from 'react'
import { Link } from 'react-router-dom'
import Overlay from './overlay'
import PropTypes from 'prop-types'


function NetworkCheck(props, context) {
  const web3Context = context.web3
  const networkNames = {
    1: "Main",
    2: "Morden",
    3: "Ropsten",
    4: "Rinkeby",
    42: "Kovan"
  }
  const supportedNetworkIds = [3, 4]
  const currentNetworkId = parseInt(web3Context.networkId, 10)
  const currentNetworkName = (networkNames[currentNetworkId] ?
    networkNames[currentNetworkId] : currentNetworkId)
  if (currentNetworkId &&
    (window.location.hostname === "demo.originprotocol.com") &&
    (supportedNetworkIds.indexOf(currentNetworkId) < 0)) {
    return (
      <Overlay imageUrl="/images/flat_cross_icon.svg">
        MetaMask should be on <strong>Rinkeby</strong> Network<br />
        Currently on {currentNetworkName}.
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
        {!props.hideLoginButton &&
          <div className="navbar-create">
            <Link to="/login">
              Login
            </Link>
          </div>
        }
      </div>
    </nav>
  )
}

export default NavBar
export { NetworkCheck }
