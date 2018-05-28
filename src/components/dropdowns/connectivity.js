import $ from 'jquery'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import origin from '../../services/origin'

const ipfsGateway = process.env.IPFS_DOMAIN || 'gateway.originprotocol.com'
const bridgeServerDomain = process.env.BRIDGE_SERVER_DOMAIN || 'bridge.originprotocol.com'
const web3 = origin.contractService.web3
const networkNames = {
  1: 'Main Ethereum Network',
  2: 'Morden Test Network',
  3: 'Ropsten Test Network',
  4: 'Rinkeby Test Network',
  42: 'Kovan Test Network',
  999: 'Localhost',
}
const ONE_SECOND = 1000

class ConnectivityDropdown extends Component {
  constructor(props) {
    super(props)

    this.state = {
      connectedStatus: {
        network: false,
        ipfsGateway: false,
        bridgeServer: false,
      },
      networkName: null,
    }
  }

  async componentDidMount() {
    !web3.givenProvider && $('#connectivityDropdown').dropdown('toggle') && setTimeout(() => {
      if ($('.connectivity.dropdown').hasClass('show')) {
        $('#connectivityDropdown').dropdown('toggle')
      }
    }, 10 * ONE_SECOND)

    try {
      const networkId = await web3.eth.net.getId()

      this.setState({
        networkName: networkNames[networkId],
        ipfsGateway,
        bridgeServerDomain,
      })

      // simulate delayed connections

      setTimeout(() => {
        this.setState({ connectedStatus: { ...this.state.connectedStatus, network: true }})
      }, ONE_SECOND)

      setTimeout(() => {
        this.setState({ connectedStatus: { ...this.state.connectedStatus, ipfsGateway: true }})
      }, 2 * ONE_SECOND)

      setTimeout(() => {
        this.setState({ connectedStatus: { ...this.state.connectedStatus, bridgeServer: true }})
      }, 3 * ONE_SECOND)
    } catch(error) {
      console.error(error)
    }
  }

  render() {
    const { networkName, ipfsGateway, connectedStatus } = this.state

    return (
      <div className="nav-item connectivity dropdown">
        <a className="nav-link active dropdown-toggle" id="connectivityDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <div className="d-flex indicators align-items-center">
            <span className={`blockchain indicator ml-auto${connectedStatus.network ? ' connected' : ''}`}></span>
            <span className={`gateway indicator m-1${connectedStatus.ipfsGateway ? ' connected' : ''}`}></span>
            <span className={`server indicator mr-auto${connectedStatus.bridgeServer ? ' connected' : ''}`}></span>
          </div>
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="connectivityDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <div className="connectivity-list">
              <ul className="list-group">
                <li className="connection d-flex flex-wrap">
                  <div className={`indicator${connectedStatus.network ? ' connected' : ''}`}></div>
                  <div className="name"><strong>Ethereum Network:</strong></div>
                  <div className="ml-auto">{connectedStatus.network ? networkName : 'Connecting...'}</div>
                </li>
                <li className="connection d-flex flex-wrap">
                  <div className={`indicator${connectedStatus.ipfsGateway ? ' connected' : ''}`}></div>
                  <div className="name"><strong>IPFS Gateway:</strong></div>
                  <div className="ml-auto">{connectedStatus.ipfsGateway ? ipfsGateway : 'Connecting...'}</div>
                </li>
                <li className="connection d-flex flex-wrap">
                  <div className={`indicator${connectedStatus.bridgeServer ? ' connected' : ''}`}></div>
                  <div className="name"><strong>Bridge Server:</strong></div>
                  <div className="ml-auto">{connectedStatus.bridgeServer ? bridgeServerDomain : 'Connecting...'}</div>
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
