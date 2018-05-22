import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import origin from '../../services/origin'

const ipfsGateway = process.env.IPFS_DOMAIN || 'gateway.originprotocol.com'
const bridgeServerDomain = process.env.BRIDGE_SERVER_DOMAIN || 'bridge.originprotocol.com'
const web3 = origin.contractService.web3
const networkNames = {
  1: 'Main',
  2: 'Morden',
  3: 'Ropsten',
  4: 'Rinkeby',
  42: 'Kovan',
  999: 'Localhost',
}

class ConnectivityDropdown extends Component {
  constructor(props) {
    super(props)

    this.state = { networkName: null }
  }

  async componentDidMount() {
    try {
      const networkId = await web3.eth.net.getId()

      this.setState({
        networkName: networkNames[networkId],
        ipfsGateway,
        bridgeServerDomain
      })
    } catch(error) {
      console.error(error)
    }
  }

  render() {
    const { networkName, ipfsGateway } = this.state

    return (
      <div className="nav-item connectivity dropdown">
        <a className="nav-link active dropdown-toggle" id="connectivityDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <div className="d-flex indicators align-items-center">
            <span className="blockchain indicator ml-auto connected"></span>
            <span className="gateway indicator m-1 connected"></span>
            <span className="server indicator mr-auto connected"></span>
          </div>
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="connectivityDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <div className="connectivity-list">
              <ul className="list-group">
                <li className="connection d-flex">
                  <div className="indicator connected"></div>
                  <div className="name"><strong>Blockchain Network:</strong></div>
                  <div>{networkName}</div>
                </li>
                <li className="connection d-flex">
                  <div className="indicator connected"></div>
                  <div className="name"><strong>IPFS Gateway:</strong></div>
                  <div>{ipfsGateway}</div>
                </li>
                <li className="connection d-flex">
                  <div className="indicator connected"></div>
                  <div className="name"><strong>Bridge Server:</strong></div>
                  <div>{bridgeServerDomain}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ConnectivityDropdown
