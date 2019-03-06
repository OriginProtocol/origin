import React, { Component } from 'react'

import origin from '../services/origin'

const { web3 } = origin.contractService

class EtherscanLink extends Component {
  constructor(props) {
    super(props)
    this.state = { networkName: null }
  }

  async componentDidMount() {
    const networkName = await web3.eth.net.getNetworkType() // Actually returns name, e.g. 'ropsten'
    this.setState({ networkName })
  }

  render() {
    const { children, className, hash, tokenAddress = '' } = this.props
    const { networkName } = this.state
    let href, path

    if (!hash) {
      throw new Error('EtherscanLink: hash must exist')
    }

    if (tokenAddress.length === 42) {
      path = `token/${tokenAddress}?a=${hash}`
      // detect transaction hashes
    } else if (hash.length === 66) {
      path = `tx/${hash}`
      // detect address hashes
    } else if (hash.length === 42) {
      path = `address/${hash}`
    } else {
      throw new Error('Unrecognized hash for EtherscanLink')
    }

    // link to the correct
    if (networkName === 'main') {
      href = `https://etherscan.io/${path}`
    } else if (networkName !== 'private') {
      href = `https://${networkName}.etherscan.io/${path}`
    } else {
      href = '/'
    }

    // render optional children or the hash
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children || hash}
      </a>
    )
  }
}

export default EtherscanLink
