import React, { Component } from 'react'
import origin from '../services/origin'

class DappInfo extends Component {
  constructor() {
    super()
    this.state = { }
  }

  async loadMarketplaceData() {
    const contracts = []
    for (const [name, contract] of Object.entries(origin.contractService.marketplaceContracts)) {
      const contractObj = await origin.contractService.deployed(contract)
      const owner = await contractObj.methods.owner().call()
      const tokenAddr = await contractObj.methods.tokenAddr().call()
      contracts.push(<tr><th colSpan="2">Marketplace Contract: {name}</th></tr>)
      contracts.push(<tr><td>Contract Address</td><td>{contractObj._address}</td></tr>)
      contracts.push(<tr><td>Owner</td><td>{owner}</td></tr>)
      contracts.push(<tr><td>Token Address</td><td>{tokenAddr}</td></tr>)
    }
    return contracts
  }

  async loadTokenData() {
    const contract = origin.contractService.contracts['OriginToken']
    const token = await origin.contractService.deployed(contract)
    const owner = await token.methods.owner().call()
    const name = await token.methods.name().call()
    const symbol = await token.methods.symbol().call()
    const decimals = await token.methods.decimals().call()
    const totalSupply = await token.methods.totalSupply().call() / 10**decimals
    const paused = (await token.methods.paused().call()) ? 'YES' : 'no'
    let whitelistStatus
    if (await token.methods.whitelistActive().call()) {
      const expiration = await token.methods.whitelistExpiration().call()
      const expirationDate = new Date(expiration * 1000)
      whitelistStatus = `active until ${expirationDate}`
    } else {
      whitelistStatus = 'not active'
    }

    return (
      <React.Fragment>
        <tr><th colSpan="2">Token Contract</th></tr>
        <tr><td>Contract Address</td><td>{token._address}</td></tr>
        <tr><td>Name</td><td>{name}</td></tr>
        <tr><td>Symbol</td><td>{symbol}</td></tr>
        <tr><td>Decimals</td><td>{decimals}</td></tr>
        <tr><td>Total Supply</td><td>{totalSupply}</td></tr>
        <tr><td>Owner</td><td>{owner}</td></tr>
        <tr><td>Paused</td><td>{paused}</td></tr>
        <tr><td>Transactor Whitelist</td><td>{whitelistStatus}</td></tr>
      </React.Fragment>
    )
  }

  async loadMultiSigData() {
    const data = [ ]
    data.push(<tr><th colSpan="2">For signing/verifiying multi-sig transactions</th></tr>)
    for (const [name, contract] of Object.entries(origin.contractService.marketplaceContracts)) {
      const contractObj = await origin.contractService.deployed(contract)
      data.push(<tr><td>{name} address</td><td>{contractObj._address}</td></tr>)
      data.push(<tr><td>{name} ABI </td><td>{JSON.stringify(contract.abi)}</td></tr>)
    }

    const tokenContractName = 'OriginToken'
    const tokenContract = origin.contractService.contracts[tokenContractName]
    const token = await origin.contractService.deployed(tokenContract)
    data.push(<tr><td>{tokenContractName} address </td><td>{token._address}</td></tr>)
    data.push(<tr><td>{tokenContractName} ABI </td><td>{JSON.stringify(tokenContract.abi)}</td></tr>)
    return data
  }

  async componentDidMount() {
    this.loadMarketplaceData()
      .then(res => this.setState(Object.assign(this.state, { marketplaceData: res })))
      .catch(e => this.setState(Object.assign(this.state, {
        marketplaceData: `error fetching marketplace data: ${e.message}`
      })))
    this.loadTokenData()
      .then(res => this.setState(Object.assign(this.state, { tokenData: res })))
      .catch(e => this.setState(Object.assign(this.state, {
        tokenData: `error fetching token data: ${e.message}`
      })))
    this.loadMultiSigData()
      .then(res => this.setState(Object.assign(this.state, { multiSigData: res })))
      .catch(e => this.setState(Object.assign(this.state, {
        multiSigData: `error fetching multi-sig data: ${e.message}`
      })))
  }

  render() {
    return (
      <div className="dapp-info-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h1>DApp Info</h1>
              <h3 className="lead">Developer information about this build</h3>
              <table width="100%">

                <tr><th colSpan="2">origin.js</th></tr>
                <tr><td>Version</td><td>{ origin.version }</td></tr>

                <tr><th colSpan="2">Environment Variables</th></tr>
                <tr><td>BRIDGE_SERVER_DOMAIN</td><td>{ process.env.BRIDGE_SERVER_DOMAIN }</td></tr>
                <tr><td>BRIDGE_SERVER_PROTOCOL</td><td>{ process.env.BRIDGE_SERVER_PROTOCOL }</td></tr>
                <tr><td>DISCOVERY_SERVER_URL</td><td>{ process.env.DISCOVERY_SERVER_URL }</td></tr>
                <tr><td>IPFS_DOMAIN</td><td>{ process.env.IPFS_DOMAIN }</td></tr>
                <tr><td>IPFS_GATEWAY_PORT</td><td>{ process.env.IPFS_GATEWAY_PORT }</td></tr>
                <tr><td>IPFS_GATEWAY_PROTOCOL</td><td>{ process.env.IPFS_GATEWAY_PROTOCOL }</td></tr>
                <tr><td>IPFS_API_PORT</td><td>{ process.env.IPFS_API_PORT }</td></tr>
                <tr><td>IPFS_SWARM</td><td>{ process.env.IPFS_SWARM }</td></tr>
                <tr><td>ARBITRATOR_ACCOUNT</td><td>{ process.env.ARBITRATOR_ACCOUNT }</td></tr>
                <tr><td>MESSAGING_ACCOUNT</td><td>{ process.env.MESSAGING_ACCOUNT }</td></tr>
                <tr><td>PROVIDER_URL</td><td>{ process.env.PROVIDER_URL }</td></tr>
                <tr><td>MESSAGING_NAMESPACE</td><td>{ process.env.MESSAGING_NAMESPACE }</td></tr>
                <tr><td>DEPLOY_TAG</td><td>{ process.env.DEPLOY_TAG }</td></tr>

                {this.state.marketplaceData}

                {this.state.tokenData}

                {this.state.multiSigData}
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DappInfo
